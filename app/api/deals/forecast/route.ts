import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const team = searchParams.get('team') || '';
    const product = searchParams.get('product') || '';

    // Calculate date ranges
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const currentQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const nextQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);

    // Build where clause for deals
    const dealWhere: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    // Apply filters
    if (team) {
      // Assuming team filter maps to deal owner or some team field
      dealWhere.owner = { name: { contains: team, mode: 'insensitive' } };
    }

    if (product) {
      // Assuming product filter maps to deal tags or description
      dealWhere.OR = [
        { tags: { has: product } },
        { description: { contains: product, mode: 'insensitive' } },
      ];
    }

    // Get all deals for analysis
    const deals = await prisma.deal.findMany({
      where: dealWhere,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate current month metrics
    const currentMonthDeals = deals.filter(deal => {
      const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
      return closeDate && closeDate >= currentMonth && closeDate < nextMonth;
    });

    const currentMonthTarget = 100000 * 100; // $100k target in cents
    const currentMonthActual = currentMonthDeals
      .filter(deal => deal.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + deal.value, 0);
    const currentMonthProjected = currentMonthDeals
      .reduce((sum, deal) => sum + (deal.value * (deal.probability || 0) / 100), 0);

    // Calculate current quarter metrics
    const currentQuarterDeals = deals.filter(deal => {
      const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
      return closeDate && closeDate >= currentQuarter && closeDate < nextQuarter;
    });

    const currentQuarterTarget = 300000 * 100; // $300k target in cents
    const currentQuarterActual = currentQuarterDeals
      .filter(deal => deal.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + deal.value, 0);
    const currentQuarterProjected = currentQuarterDeals
      .reduce((sum, deal) => sum + (deal.value * (deal.probability || 0) / 100), 0);

    // Calculate pipeline metrics
    const activeDeals = deals.filter(deal => 
      deal.stage !== 'CLOSED_WON' && deal.stage !== 'CLOSED_LOST'
    );
    
    const pipelineWeighted = activeDeals.reduce((sum, deal) => 
      sum + (deal.value * (deal.probability || 0) / 100), 0
    );
    const pipelineUnweighted = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
    const pipelineBestCase = activeDeals
      .filter(deal => (deal.probability || 0) >= 70)
      .reduce((sum, deal) => sum + deal.value, 0);
    const pipelineWorstCase = activeDeals
      .filter(deal => (deal.probability || 0) >= 30)
      .reduce((sum, deal) => sum + (deal.value * 0.3), 0);

    // Calculate trends
    const previousMonthDeals = deals.filter(deal => {
      const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
      return closeDate && closeDate >= previousMonth && closeDate < currentMonth;
    });

    const previousQuarterDeals = deals.filter(deal => {
      const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
      return closeDate && closeDate >= previousQuarter && closeDate < currentQuarter;
    });

    const previousMonthRevenue = previousMonthDeals
      .filter(deal => deal.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + deal.value, 0);

    const previousQuarterRevenue = previousQuarterDeals
      .filter(deal => deal.stage === 'CLOSED_WON')
      .reduce((sum, deal) => sum + deal.value, 0);

    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((currentMonthActual - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    const quarterlyGrowth = previousQuarterRevenue > 0
      ? ((currentQuarterActual - previousQuarterRevenue) / previousQuarterRevenue) * 100
      : 0;

    // Calculate conversion rate
    const totalDeals = deals.length;
    const wonDeals = deals.filter(deal => deal.stage === 'CLOSED_WON').length;
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Calculate average deal size
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

    // Get upcoming deals (closing in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingDeals = deals
      .filter(deal => {
        if (!deal.closeDate || deal.stage === 'CLOSED_WON' || deal.stage === 'CLOSED_LOST') {
          return false;
        }
        const closeDate = new Date(deal.closeDate);
        return closeDate >= now && closeDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime())
      .slice(0, 10)
      .map(deal => ({
        id: deal.id,
        name: deal.name,
        value: deal.value,
        probability: deal.probability || 0,
        closeDate: deal.closeDate!,
        stage: deal.stage,
        company: deal.company,
      }));

    // Identify at-risk deals
    const riskDeals = deals
      .filter(deal => {
        if (deal.stage === 'CLOSED_WON' || deal.stage === 'CLOSED_LOST') {
          return false;
        }

        const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
        const isOverdue = closeDate && closeDate < now;
        const isLowProbability = (deal.probability || 0) < 30;
        const isStagnant = deal.lastActivity && 
          new Date(deal.lastActivity) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days ago

        return isOverdue || isLowProbability || isStagnant;
      })
      .slice(0, 10)
      .map(deal => {
        const closeDate = deal.closeDate ? new Date(deal.closeDate) : null;
        const isOverdue = closeDate && closeDate < now;
        const isLowProbability = (deal.probability || 0) < 30;
        const isStagnant = deal.lastActivity && 
          new Date(deal.lastActivity) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        let riskReason = '';
        if (isOverdue) riskReason = 'Overdue';
        else if (isLowProbability) riskReason = 'Low probability';
        else if (isStagnant) riskReason = 'No recent activity';

        return {
          id: deal.id,
          name: deal.name,
          value: deal.value,
          probability: deal.probability || 0,
          closeDate: deal.closeDate!,
          stage: deal.stage,
          riskReason,
          company: deal.company,
        };
      });

    const forecastData = {
      currentMonth: {
        target: currentMonthTarget,
        actual: currentMonthActual,
        projected: currentMonthProjected,
        deals: currentMonthDeals.length,
      },
      currentQuarter: {
        target: currentQuarterTarget,
        actual: currentQuarterActual,
        projected: currentQuarterProjected,
        deals: currentQuarterDeals.length,
      },
      pipeline: {
        weighted: pipelineWeighted,
        unweighted: pipelineUnweighted,
        bestCase: pipelineBestCase,
        worstCase: pipelineWorstCase,
      },
      trends: {
        monthlyGrowth,
        quarterlyGrowth,
        conversionRate,
        averageDealSize,
      },
      upcomingDeals,
      riskDeals,
    };

    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 