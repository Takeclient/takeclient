import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { getTenantPlanInfo } from '@/app/lib/plan-limits';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Get tenant plan information with usage
    const planInfo = await getTenantPlanInfo(tenantId);
    
    if (!planInfo) {
      return NextResponse.json({ error: 'Plan information not found' }, { status: 404 });
    }

    return NextResponse.json(planInfo);
  } catch (error) {
    console.error('Error fetching current plan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 