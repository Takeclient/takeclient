import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';

// GET - Get single plan (Super admin only)
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
    
    // Check if user has permission to manage plans
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update plan (Super admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existingPlan.name) {
      const nameConflict = await prisma.plan.findUnique({
        where: { name: data.name },
      });

      if (nameConflict) {
        return NextResponse.json({ 
          error: 'Plan with this name already exists' 
        }, { status: 409 });
      }
    }

    // Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        price: data.price,
        yearlyPrice: data.yearlyPrice || null,
        stripePriceId: data.stripePriceId || null,
        stripeYearlyPriceId: data.stripeYearlyPriceId || null,
        features: data.features,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
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

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Partial update (for toggle active, etc.)
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
    
    // Check if user has permission to manage plans
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {};
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.stripePriceId !== undefined) updateData.stripePriceId = data.stripePriceId;
    if (data.stripeYearlyPriceId !== undefined) updateData.stripeYearlyPriceId = data.stripeYearlyPriceId;

    // Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete plan (Super admin only)
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
    
    // Check if user has permission to manage plans
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if plan exists and get tenant count
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tenants: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Prevent deletion if plan has active tenants or subscriptions
    if (plan._count.tenants > 0 || plan._count.subscriptions > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete plan with active tenants or subscriptions' 
      }, { status: 400 });
    }

    // Delete plan
    await prisma.plan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 