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

    const data = await req.json();
    const { planId, interval } = data;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get the target plan
    const targetPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!targetPlan || !targetPlan.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive plan' }, { status: 400 });
    }

    // Get current tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // For free plans, allow immediate upgrade
    if (targetPlan.price === 0) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { planId: targetPlan.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Plan updated successfully',
      });
    }

    // For paid plans, in a real implementation, you would:
    // 1. Create Stripe checkout session
    // 2. Return checkout URL
    // 3. Handle webhook for successful payment
    
    // For now, let's simulate this process
    const price = interval === 'yearly' && targetPlan.yearlyPrice 
      ? targetPlan.yearlyPrice 
      : targetPlan.price;

    // In a real implementation, you would create a Stripe checkout session:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: interval === 'yearly' 
            ? targetPlan.stripeYearlyPriceId 
            : targetPlan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        tenantId,
        planId,
        interval,
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
      customer_email: session.user?.email,
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    });
    */

    // For demo purposes, simulate successful upgrade
    if (process.env.NODE_ENV === 'development') {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { planId: targetPlan.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Plan upgraded successfully (demo mode)',
      });
    }

    return NextResponse.json({
      error: 'Payment processing not configured. Please contact support.',
    }, { status: 400 });

  } catch (error) {
    console.error('Error upgrading plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 