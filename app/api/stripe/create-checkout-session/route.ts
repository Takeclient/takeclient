import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId } from '@/app/lib/stripe';
import { PLAN_CONFIGS } from '@/app/lib/plans';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tenantId, planName, billingInterval, email } = await req.json();

    // Validate required fields
    if (!tenantId || !planName || !billingInterval || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get plan configuration
    const planConfig = PLAN_CONFIGS[planName as keyof typeof PLAN_CONFIGS];
    if (!planConfig || planConfig.price === 0) {
      return NextResponse.json(
        { error: 'Invalid plan or free plan selected' },
        { status: 400 }
      );
    }

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Try to get existing Stripe price ID
    let priceId = getStripePriceId(planName, billingInterval);
    
    if (!priceId) {
      // Create product if it doesn't exist
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });
      
      let product = products.data.find((p: any) => 
        p.metadata?.planName === planName
      );
      
      if (!product) {
        product = await stripe.products.create({
          name: `CRM Pro - ${planConfig.displayName}`,
          description: planConfig.description,
          metadata: {
            planName: planName,
          },
        });
      }

      // Create price
      const price = billingInterval === 'yearly' ? planConfig.yearlyPrice : planConfig.price;
      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: price,
        currency: 'usd',
        recurring: {
          interval: billingInterval === 'yearly' ? 'year' : 'month',
        },
        metadata: {
          planName: planName,
          interval: billingInterval,
        },
      });

      priceId = stripePrice.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email, // Use email instead of customer ID for new customers
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/auth/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/auth/signup?plan=${planName}&cancelled=true`,
      metadata: {
        tenantId: tenantId,
        planName: planName,
        billingInterval: billingInterval,
      },
      subscription_data: {
        metadata: {
          tenantId: tenantId,
          planName: planName,
        },
        trial_period_days: 14, // 14-day free trial
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 