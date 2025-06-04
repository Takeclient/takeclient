import { prisma } from './prisma';

export interface PlanLimits {
  contacts: number;
  deals: number;
  companies: number;
  users: number;
  forms: number;
  products: number;
  automations: number;
  storage: string;
  support: string;
  integrations: number;
}

export interface UsageStats {
  contacts: number;
  deals: number;
  companies: number;
  users: number;
  forms: number;
  products: number;
  automations: number;
}

// Check if a tenant can create a new resource of the specified type
export async function checkPlanLimit(
  tenantId: string,
  resourceType: keyof PlanLimits,
  requestedCount: number = 1
): Promise<{ allowed: boolean; currentUsage: number; limit: number; message?: string }> {
  try {
    // Get tenant with plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
      },
    });

    if (!tenant || !tenant.plan) {
      return {
        allowed: false,
        currentUsage: 0,
        limit: 0,
        message: 'No valid plan found for tenant',
      };
    }

    const planFeatures = tenant.plan.features as unknown as PlanLimits;
    const limit = planFeatures[resourceType];

    // If limit is -1, it means unlimited
    if (typeof limit === 'number' && limit === -1) {
      return {
        allowed: true,
        currentUsage: 0,
        limit: -1,
      };
    }

    // For non-numeric limits (like storage, support), allow for now
    if (typeof limit !== 'number') {
      return {
        allowed: true,
        currentUsage: 0,
        limit: 0,
      };
    }

    // Get current usage
    const currentUsage = await getCurrentUsage(tenantId, resourceType);

    // Check if adding requested count would exceed limit
    const wouldExceed = currentUsage + requestedCount > limit;

    return {
      allowed: !wouldExceed,
      currentUsage,
      limit,
      message: wouldExceed 
        ? `This action would exceed your plan limit of ${limit} ${resourceType}. Current usage: ${currentUsage}/${limit}`
        : undefined,
    };
  } catch (error) {
    console.error('Error checking plan limit:', error);
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      message: 'Error checking plan limits',
    };
  }
}

// Get current usage for a tenant
export async function getCurrentUsage(
  tenantId: string,
  resourceType?: keyof PlanLimits
): Promise<number> {
  try {
    switch (resourceType) {
      case 'contacts':
        return await prisma.contact.count({
          where: { tenantId },
        });
      
      case 'deals':
        return await prisma.deal.count({
          where: { tenantId },
        });
      
      case 'companies':
        return await prisma.company.count({
          where: { tenantId },
        });
      
      case 'users':
        return await prisma.user.count({
          where: { tenantId },
        });
      
      case 'forms':
        return await prisma.form.count({
          where: { tenantId },
        });
      
      case 'products':
        return await prisma.product.count({
          where: { tenantId },
        });
      
      case 'automations':
        return await prisma.workflow.count({
          where: { tenantId },
        });
      
      default:
        return 0;
    }
  } catch (error) {
    console.error('Error getting current usage:', error);
    return 0;
  }
}

// Get all usage stats for a tenant
export async function getUsageStats(tenantId: string): Promise<UsageStats> {
  try {
    const [contacts, deals, companies, users, forms, products, automations] = await Promise.all([
      prisma.contact.count({ where: { tenantId } }),
      prisma.deal.count({ where: { tenantId } }),
      prisma.company.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId } }),
      prisma.form.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId } }),
      prisma.workflow.count({ where: { tenantId } }),
    ]);

    return {
      contacts,
      deals,
      companies,
      users,
      forms,
      products,
      automations,
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {
      contacts: 0,
      deals: 0,
      companies: 0,
      users: 0,
      forms: 0,
      products: 0,
      automations: 0,
    };
  }
}

// Get tenant plan with limits and usage
export async function getTenantPlanInfo(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
      },
    });

    if (!tenant || !tenant.plan) {
      return null;
    }

    const usage = await getUsageStats(tenantId);
    const planFeatures = tenant.plan.features as unknown as PlanLimits;

    return {
      plan: tenant.plan,
      features: planFeatures,
      usage,
      limits: {
        contacts: {
          used: usage.contacts,
          limit: planFeatures.contacts,
          percentage: planFeatures.contacts === -1 ? 0 : Math.round((usage.contacts / planFeatures.contacts) * 100),
        },
        deals: {
          used: usage.deals,
          limit: planFeatures.deals,
          percentage: planFeatures.deals === -1 ? 0 : Math.round((usage.deals / planFeatures.deals) * 100),
        },
        companies: {
          used: usage.companies,
          limit: planFeatures.companies,
          percentage: planFeatures.companies === -1 ? 0 : Math.round((usage.companies / planFeatures.companies) * 100),
        },
        users: {
          used: usage.users,
          limit: planFeatures.users,
          percentage: planFeatures.users === -1 ? 0 : Math.round((usage.users / planFeatures.users) * 100),
        },
        forms: {
          used: usage.forms,
          limit: planFeatures.forms,
          percentage: planFeatures.forms === -1 ? 0 : Math.round((usage.forms / planFeatures.forms) * 100),
        },
        products: {
          used: usage.products,
          limit: planFeatures.products,
          percentage: planFeatures.products === -1 ? 0 : Math.round((usage.products / planFeatures.products) * 100),
        },
        automations: {
          used: usage.automations,
          limit: planFeatures.automations,
          percentage: planFeatures.automations === -1 ? 0 : Math.round((usage.automations / planFeatures.automations) * 100),
        },
      },
    };
  } catch (error) {
    console.error('Error getting tenant plan info:', error);
    return null;
  }
}

// Check if tenant has access to a specific feature
export async function hasFeatureAccess(
  tenantId: string,
  feature: string
): Promise<boolean> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plan: true,
      },
    });

    if (!tenant || !tenant.plan) {
      return false;
    }

    const planFeatures = tenant.plan.features as any;
    
    // Check specific feature access based on plan
    switch (feature) {
      case 'form_builder':
        return planFeatures.forms > 0 || planFeatures.forms === -1;
      
      case 'api_access':
        return planFeatures.apiAccess === true;
      
      case 'custom_domain':
        return planFeatures.customDomain === true;
      
      case 'advanced_reports':
        return planFeatures.advancedReports === true;
      
      case 'integrations':
        return planFeatures.integrations > 0 || planFeatures.integrations === -1;
      
      default:
        return true; // Allow access to basic features by default
    }
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
} 