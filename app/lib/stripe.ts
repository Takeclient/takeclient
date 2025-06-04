import Stripe from 'stripe';
import { PLAN_CONFIGS, type PlanName } from './plans';

// This file is SERVER-SIDE ONLY - never import this in client components
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Server-side plan configurations with Stripe price IDs
export const STRIPE_PLAN_CONFIG = {
  FREE: {
    ...PLAN_CONFIGS.FREE,
    stripePriceId: null,
    stripeYearlyPriceId: null,
  },
  NORMAL: {
    ...PLAN_CONFIGS.NORMAL,
    stripePriceId: process.env.STRIPE_NORMAL_PRICE_ID || null,
    stripeYearlyPriceId: process.env.STRIPE_NORMAL_YEARLY_PRICE_ID || null,
  },
  PREMIUM: {
    ...PLAN_CONFIGS.PREMIUM,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || null,
    stripeYearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || null,
  },
  ELITE: {
    ...PLAN_CONFIGS.ELITE,
    stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || null,
    stripeYearlyPriceId: process.env.STRIPE_ELITE_YEARLY_PRICE_ID || null,
  }
} as const;

// Helper function to get Stripe price ID for a plan
export function getStripePriceId(planName: string, billingInterval: 'monthly' | 'yearly'): string | null {
  const plan = STRIPE_PLAN_CONFIG[planName as PlanName];
  if (!plan) return null;
  
  return billingInterval === 'yearly' ? plan.stripeYearlyPriceId : plan.stripePriceId;
} 