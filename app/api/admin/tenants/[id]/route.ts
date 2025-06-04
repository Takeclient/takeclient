import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';

// GET - Get single tenant details (Super admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        plan: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isOwner: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            contacts: true,
            companies: true,
            deals: true,
            forms: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update tenant (Super admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.planId && { planId: data.planId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        plan: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
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
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TENANT',
        resource: 'tenant',
        resourceId: tenant.id,
        userId: user.id,
        oldValues: {},
        newValues: data,
        metadata: {
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete tenant (Super admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if tenant exists and has no users
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant._count.users > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete tenant with active users. Please remove all users first.' 
      }, { status: 400 });
    }

    // Delete tenant (cascading deletes will handle related records)
    await prisma.tenant.delete({
      where: { id: params.id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TENANT',
        resource: 'tenant',
        resourceId: tenant.id,
        userId: user.id,
        metadata: {
          tenantName: tenant.name,
        },
      },
    });

    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 