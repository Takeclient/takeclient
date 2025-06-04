// Plan configurations that can be safely used on both client and server
export const PLAN_CONFIGS = {
  FREE: {
    name: 'FREE',
    displayName: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    yearlyPrice: 0,
    features: {
      contacts: 100,
      forms: 3,
      submissions: 100,
      users: 1,
      deals: 50,
      companies: 25,
      storage: '100MB',
      support: 'Community',
      customDomain: false,
      apiAccess: false,
      advancedReports: false,
      integrations: false,
      customBranding: false,
      priority: 'low'
    } as Record<string, any>
  },
  NORMAL: {
    name: 'NORMAL',
    displayName: 'Normal',
    description: 'Great for small teams',
    price: 2900, // $29.00
    yearlyPrice: 29000, // $290.00
    features: {
      contacts: 2500,
      forms: 15,
      submissions: 2500,
      users: 3,
      deals: 500,
      companies: 200,
      storage: '1GB',
      support: 'Email',
      customDomain: false,
      apiAccess: true,
      advancedReports: false,
      integrations: 'basic',
      customBranding: false,
      priority: 'normal'
    } as Record<string, any>
  },
  PREMIUM: {
    name: 'PREMIUM',
    displayName: 'Premium',
    description: 'Best for growing businesses',
    price: 5900, // $59.00
    yearlyPrice: 59000, // $590.00
    features: {
      contacts: 10000,
      forms: 50,
      submissions: 10000,
      users: 10,
      deals: 2000,
      companies: 1000,
      storage: '5GB',
      support: 'Priority Email',
      customDomain: true,
      apiAccess: true,
      advancedReports: true,
      integrations: 'advanced',
      customBranding: true,
      priority: 'high'
    } as Record<string, any>
  },
  ELITE: {
    name: 'ELITE',
    displayName: 'Elite',
    description: 'For enterprise organizations',
    price: 11900, // $119.00
    yearlyPrice: 119000, // $1190.00
    features: {
      contacts: -1, // Unlimited
      forms: -1,
      submissions: -1,
      users: -1,
      deals: -1,
      companies: -1,
      storage: '50GB',
      support: 'Phone & Email',
      customDomain: true,
      apiAccess: true,
      advancedReports: true,
      integrations: 'enterprise',
      customBranding: true,
      priority: 'enterprise',
      dedicatedManager: true,
      sla: '99.9%',
      customFields: true
    } as Record<string, any>
  }
} as const;

export type PlanName = keyof typeof PLAN_CONFIGS;

// Helper functions that are safe for client-side use
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(priceInCents / 100);
}

export function getPlanByName(planName: string): typeof PLAN_CONFIGS[PlanName] | null {
  return PLAN_CONFIGS[planName as PlanName] || null;
}

export function isFeatureAvailable(plan: any, feature: string): boolean {
  if (!plan?.features) return false;
  
  const featureValue = plan.features[feature];
  
  // If feature value is -1, it means unlimited
  if (featureValue === -1) return true;
  
  // If it's a boolean, return its value
  if (typeof featureValue === 'boolean') return featureValue;
  
  // If it's a number, check if it's greater than 0
  if (typeof featureValue === 'number') return featureValue > 0;
  
  // If it's a string, check if it's not empty and not 'false'
  if (typeof featureValue === 'string') return featureValue !== '' && featureValue !== 'false';
  
  return false;
}

export function getUsageLimit(plan: any, resource: string): number {
  if (!plan?.features) return 0;
  
  const limit = plan.features[resource];
  return typeof limit === 'number' ? limit : 0;
}

export function isUnlimited(plan: any, resource: string): boolean {
  if (!plan?.features) return false;
  return plan.features[resource] === -1;
} 