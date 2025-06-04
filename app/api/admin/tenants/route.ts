import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';
import { auditTenantCreation, auditTenantUpdate } from '@/app/lib/audit';

// Get request headers for audit logging
function getRequestInfo(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

// GET - List all tenants (Super admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to manage all tenants
    if (!hasPermission(user.role, Permission.MANAGE_ALL_TENANTS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const planId = searchParams.get('planId');
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (planId) {
      where.planId = planId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get tenants with related data
    const tenants = await prisma.tenant.findMany({
        where,
        include: {
          plan: {
            select: {
              id: true,
              displayName: true,
              price: true,
            },
          },
        subscriptions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
            currentPeriodEnd: true,
          },
        },
          _count: {
            select: {
              users: true,
              contacts: true,
            companies: true,
              deals: true,
          },
            },
          },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      tenants,
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new tenant (Super admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to manage all tenants
    if (!hasPermission(user.role, Permission.MANAGE_ALL_TENANTS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.slug || !data.planId) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, slug, planId' 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existingTenant) {
      return NextResponse.json({ 
        error: 'Tenant with this slug already exists' 
      }, { status: 409 });
    }

    // Verify plan exists and is active
      const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
      });

    if (!plan || !plan.isActive) {
        return NextResponse.json({ 
        error: 'Invalid or inactive plan' 
      }, { status: 400 });
    }

    // Create tenant with subscription
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        planId: data.planId,
        subscriptions: {
          create: {
            planId: data.planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            interval: 'MONTHLY',
          },
        },
      },
      include: {
        plan: true,
        subscriptions: true,
        _count: {
          select: {
            users: true,
            contacts: true,
            companies: true,
            deals: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'tenant',
        resourceId: tenant.id,
        userId: user.id,
        metadata: {
          tenantName: tenant.name,
          planId: tenant.planId,
        },
      },
    });

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update tenant (Super admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = session.user as any;
    
    // Check if user has permission to manage tenants
    if (!hasPermission(adminUser.role, Permission.MANAGE_ALL_TENANTS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      id, 
      name, 
      slug, 
      subdomain,
      customDomain,
      planId,
      trialEndsAt 
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Get existing tenant
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== existingTenant.slug) {
      const tenantWithSlug = await prisma.tenant.findUnique({
        where: { slug },
      });

      if (tenantWithSlug) {
        return NextResponse.json({ 
          error: 'Tenant with this slug already exists' 
        }, { status: 409 });
      }
    }

    // Check if subdomain is being changed and if it already exists
    if (subdomain && subdomain !== existingTenant.subdomain) {
      const tenantWithSubdomain = await prisma.tenant.findUnique({
        where: { subdomain },
      });

      if (tenantWithSubdomain) {
        return NextResponse.json({ 
          error: 'Tenant with this subdomain already exists' 
        }, { status: 409 });
      }
    }

    // Validate plan exists if changing plan
    if (planId && planId !== existingTenant.planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return NextResponse.json({ 
          error: 'Plan not found' 
        }, { status: 404 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (subdomain !== undefined) updateData.subdomain = subdomain;
    if (customDomain !== undefined) updateData.customDomain = customDomain;
    if (planId !== undefined) updateData.planId = planId;
    if (trialEndsAt !== undefined) {
      updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        plan: true,
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestInfo(req);
    await auditTenantUpdate(
      id,
      existingTenant,
      updateData,
      adminUser.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ tenant: updatedTenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete tenant (Super admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = session.user as any;
    
    // Check if user has permission to manage tenants
    if (!hasPermission(adminUser.role, Permission.MANAGE_ALL_TENANTS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    // Get tenant to delete
    const tenantToDelete = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            contacts: true,
            forms: true,
          },
        },
      },
    });

    if (!tenantToDelete) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Prevent deletion if tenant has data (safety check)
    const hasData = tenantToDelete._count.users > 0 || 
                   tenantToDelete._count.contacts > 0 || 
                   tenantToDelete._count.forms > 0;

    if (hasData) {
      return NextResponse.json({ 
        error: 'Cannot delete tenant with existing data. Please remove all users, contacts, and forms first.' 
      }, { status: 400 });
    }

    // Delete tenant
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestInfo(req);
    await auditTenantUpdate(
      tenantId,
      tenantToDelete,
      { deleted: true },
      adminUser.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 