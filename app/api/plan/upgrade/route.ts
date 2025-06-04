import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    const { planId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Verify the plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Get current tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if it's the same plan
    if (tenant.planId === planId) {
      return NextResponse.json({ error: 'You are already on this plan' }, { status: 400 });
    }

    // For free plan upgrades or downgrades, just update directly
    if (plan.name === 'FREE' || tenant.plan?.name === 'FREE') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { planId: planId }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Successfully ${plan.price > (tenant.plan?.price || 0) ? 'upgraded' : 'updated'} to ${plan.displayName} plan`
      });
    }

    // For paid plans, you would typically:
    // 1. Create a Stripe checkout session for upgrades
    // 2. Update subscription for plan changes
    // For now, we'll just update the plan directly for demo purposes
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { planId: planId }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully ${plan.price > (tenant.plan?.price || 0) ? 'upgraded' : 'downgraded'} to ${plan.displayName} plan`
    });

  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 