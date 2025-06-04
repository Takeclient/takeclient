import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user is admin and has tenant
    if (user.role !== 'TENANT_ADMIN' || !user.tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get tenant information
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        name: true,
        slug: true,
        subdomain: true,
        customDomain: true,
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Return tenant settings (some fields may not exist in current schema)
    const tenantSettings = {
      name: tenant.name,
      description: '', // Not in current schema
      website: tenant.customDomain || '', // Using customDomain as website
      industry: '', // Not in current schema
      size: '', // Not in current schema
      timezone: 'UTC', // Default
      dateFormat: 'MM/DD/YYYY', // Default
      currency: 'USD', // Default
    };

    return NextResponse.json(tenantSettings);
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();
    
    // Check if user is admin and has tenant
    if (user.role !== 'TENANT_ADMIN' || !user.tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { name, website } = body;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    // Update tenant (only fields that exist in current schema)
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        name: name.trim(),
        customDomain: website?.trim() || null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 