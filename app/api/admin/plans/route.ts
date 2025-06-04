import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';

// GET - List all plans (Super admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to manage plans
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause
    const where: any = {};
    
    if (!includeInactive) {
      where.isActive = true;
    }

    // Get plans with tenant count
    const plans = await prisma.plan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new plan (Super admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to manage plans
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.displayName || !data.description) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, displayName, description' 
      }, { status: 400 });
    }

    // Check if plan name already exists
    const existingPlan = await prisma.plan.findUnique({
      where: { name: data.name },
    });

    if (existingPlan) {
      return NextResponse.json({ 
        error: 'Plan with this name already exists' 
      }, { status: 409 });
    }

    // Create plan
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        price: data.price || 0,
        yearlyPrice: data.yearlyPrice || null,
        stripePriceId: data.stripePriceId || null,
        stripeYearlyPriceId: data.stripeYearlyPriceId || null,
        features: data.features || {},
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
      },
      include: {
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 