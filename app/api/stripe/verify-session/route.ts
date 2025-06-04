import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid' && session.mode === 'subscription') {
      // For subscription mode, we might have a trial
      if (!session.subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 400 }
        );
      }
    }

    const tenantId = session.metadata?.tenantId;
    const planName = session.metadata?.planName;
    const billingInterval = session.metadata?.billingInterval;

    if (!tenantId || !planName) {
      return NextResponse.json(
        { error: 'Invalid session metadata' },
        { status: 400 }
      );
    }

    // Get the subscription details from Stripe
    let subscriptionData = null;
    if (session.subscription) {
      const subscription = typeof session.subscription === 'string' 
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription;
      subscriptionData = subscription;
    }

    // Update tenant and subscription in database
    const result = await prisma.$transaction(async (tx) => {
      // Update tenant with Stripe customer ID if not already set
      if (session.customer) {
        const customerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer.id;

        await tx.tenant.update({
          where: { id: tenantId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Update or create subscription record
      if (subscriptionData) {
        const existingSubscription = await tx.subscription.findFirst({
          where: { tenantId: tenantId },
        });

        if (existingSubscription) {
          await tx.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              stripeSubscriptionId: subscriptionData.id,
              status: subscriptionData.status.toUpperCase() as any,
              currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
              currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
              trialStart: subscriptionData.trial_start 
                ? new Date(subscriptionData.trial_start * 1000) 
                : null,
              trialEnd: subscriptionData.trial_end 
                ? new Date(subscriptionData.trial_end * 1000) 
                : null,
            },
          });
        } else {
          // Find the plan
          const plan = await tx.plan.findUnique({
            where: { name: planName }
          });

          if (plan) {
            await tx.subscription.create({
              data: {
                tenantId: tenantId,
                planId: plan.id,
                stripeSubscriptionId: subscriptionData.id,
                status: subscriptionData.status.toUpperCase() as any,
                interval: billingInterval === 'yearly' ? 'YEARLY' : 'MONTHLY',
                currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
                currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
                trialStart: subscriptionData.trial_start 
                  ? new Date(subscriptionData.trial_start * 1000) 
                  : null,
                trialEnd: subscriptionData.trial_end 
                  ? new Date(subscriptionData.trial_end * 1000) 
                  : null,
              },
            });
          }
        }
      }

      return { success: true };
    });

    // Return subscription details
    return NextResponse.json({
      success: true,
      planName,
      interval: billingInterval,
      trialEnd: subscriptionData?.trial_end 
        ? new Date(subscriptionData.trial_end * 1000).toISOString()
        : null,
      status: subscriptionData?.status || 'active',
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
} 