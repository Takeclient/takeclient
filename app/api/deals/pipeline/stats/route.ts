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

    // Get all deals for the tenant
    const deals = await prisma.deal.findMany({
      where: {
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        value: true,
        stage: true,
        createdAt: true,
        updatedAt: true,
        closeDate: true,
      },
    });

    // Calculate basic stats
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

    // Calculate conversion rate (closed won / total deals)
    const closedWonDeals = deals.filter(deal => deal.stage === 'CLOSED_WON').length;
    const conversionRate = totalDeals > 0 ? (closedWonDeals / totalDeals) * 100 : 0;

    // Calculate average sales cycle (for closed deals)
    const closedDeals = deals.filter(deal => 
      deal.stage === 'CLOSED_WON' || deal.stage === 'CLOSED_LOST'
    );
    
    let averageSalesCycle = 0;
    if (closedDeals.length > 0) {
      const totalDays = closedDeals.reduce((sum, deal) => {
        const created = new Date(deal.createdAt);
        const closed = deal.closeDate ? new Date(deal.closeDate) : new Date(deal.updatedAt);
        const diffTime = closed.getTime() - created.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      averageSalesCycle = Math.round(totalDays / closedDeals.length);
    }

    // Calculate stage-specific stats
    const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    const stageStats: { [key: string]: { count: number; value: number; averageTime: number } } = {};

    stages.forEach(stage => {
      const stageDeals = deals.filter(deal => deal.stage === stage);
      const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
      
      // Calculate average time in stage (simplified - using creation to now/close)
      let averageTime = 0;
      if (stageDeals.length > 0) {
        const totalTime = stageDeals.reduce((sum, deal) => {
          const created = new Date(deal.createdAt);
          const now = new Date();
          const diffTime = now.getTime() - created.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        averageTime = Math.round(totalTime / stageDeals.length);
      }

      stageStats[stage] = {
        count: stageDeals.length,
        value: stageValue,
        averageTime,
      };
    });

    const stats = {
      totalValue,
      totalDeals,
      averageDealSize,
      conversionRate,
      averageSalesCycle,
      stageStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching pipeline stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 