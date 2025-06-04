import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getTenantPlanInfo } from '@/app/lib/plan-limits';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Super admin bypass - return unlimited usage
    if (user?.isSuperAdmin || user?.role === 'SUPER_ADMIN') {
      return NextResponse.json({
        planName: 'Super Admin',
        usage: { contacts: 0, deals: 0, companies: 0, users: 0, forms: 0 },
        limits: {
          contacts: { used: 0, limit: -1, percentage: 0 },
          deals: { used: 0, limit: -1, percentage: 0 },
          companies: { used: 0, limit: -1, percentage: 0 },
          users: { used: 0, limit: -1, percentage: 0 },
          forms: { used: 0, limit: -1, percentage: 0 },
        },
        features: {
          contacts: -1,
          deals: -1,
          companies: -1,
          users: -1,
          forms: -1,
          storage: 'Unlimited',
          support: 'Priority',
          automations: -1,
          integrations: -1,
        },
        forms: {
          canCreate: true,
          currentCount: 0,
          limit: -1,
          percentage: 0,
          message: 'Unlimited forms available'
        }
      });
    }

    const tenantId = user?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Get tenant plan info
    const planInfo = await getTenantPlanInfo(tenantId);
    if (!planInfo) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      planName: planInfo.plan.displayName,
      usage: planInfo.usage,
      limits: planInfo.limits,
      features: planInfo.features,
      forms: {
        canCreate: planInfo.limits.forms.used < planInfo.limits.forms.limit || planInfo.limits.forms.limit === -1,
        currentCount: planInfo.limits.forms.used,
        limit: planInfo.limits.forms.limit,
        percentage: planInfo.limits.forms.percentage,
        message: planInfo.limits.forms.used >= planInfo.limits.forms.limit && planInfo.limits.forms.limit !== -1 
          ? `You have reached your form limit (${planInfo.limits.forms.limit} forms). Upgrade your plan to create more forms.`
          : undefined
      }
    });

  } catch (error) {
    console.error('Error fetching plan usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 