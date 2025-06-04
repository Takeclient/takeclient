import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const period = parseInt(searchParams.get('period') || '30'); // days

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      totalRevenue,
      newContacts,
      newDeals,
      previousContacts,
      previousDeals,
      previousRevenue,
      closedDeals,
      upcomingTasks,
      overdueActivities,
    ] = await Promise.all([
      // Current totals
      prisma.contact.count({
        where: { tenantId: user.tenantId },
      }),
      prisma.company.count({
        where: { tenantId: user.tenantId },
      }),
      prisma.deal.count({
        where: { 
          tenantId: user.tenantId,
          stage: { not: 'CLOSED_LOST' }
        },
      }),
      prisma.deal.aggregate({
        where: { 
          tenantId: user.tenantId,
          stage: 'CLOSED_WON'
        },
        _sum: { value: true },
      }),
      
      // New items in current period
      prisma.contact.count({
        where: {
          tenantId: user.tenantId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.deal.count({
        where: {
          tenantId: user.tenantId,
          createdAt: { gte: startDate },
        },
      }),
      
      // Previous period for growth calculation
      prisma.contact.count({
        where: {
          tenantId: user.tenantId,
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      prisma.deal.count({
        where: {
          tenantId: user.tenantId,
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
      }),
      prisma.deal.aggregate({
        where: {
          tenantId: user.tenantId,
          stage: 'CLOSED_WON',
          updatedAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
        _sum: { value: true },
      }),
      
      // Other metrics
      prisma.deal.count({
        where: {
          tenantId: user.tenantId,
          stage: 'CLOSED_WON',
          updatedAt: { gte: startDate },
        },
      }),
      prisma.task.count({
        where: {
          tenantId: user.tenantId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { gte: now },
        },
      }),
      prisma.activity.count({
        where: {
          tenantId: user.tenantId,
          scheduledAt: { lt: now },
          isCompleted: false,
        },
      }),
    ]);

    // Calculate growth percentages
    const contactsGrowth = previousContacts > 0 
      ? Math.round(((newContacts - previousContacts) / previousContacts) * 100)
      : 0;
    
    const dealsGrowth = previousDeals > 0
      ? Math.round(((newDeals - previousDeals) / previousDeals) * 100)
      : 0;
    
    const currentRevenue = totalRevenue._sum.value || 0;
    const prevRevenue = previousRevenue._sum.value || 0;
    const revenueGrowth = prevRevenue > 0
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : 0;

    // Get contact stage distribution
    const contactStageDistribution = await prisma.contact.groupBy({
      by: ['status'],
      where: { tenantId: user.tenantId },
      _count: true,
    });

    const contactsByStage = contactStageDistribution.map(item => ({
      stage: item.status.replace('_', ' '),
      count: item._count,
      color: getStageColor(item.status),
    }));

    // Get deal stage distribution
    const dealStageDistribution = await prisma.deal.groupBy({
      by: ['stage'],
      where: { tenantId: user.tenantId },
      _count: true,
      _sum: { value: true },
    });

    const dealsByStage = dealStageDistribution.map(item => ({
      stage: item.stage.replace('_', ' '),
      count: item._count,
      value: item._sum.value || 0,
      color: getDealStageColor(item.stage),
    }));

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { tenantId: user.tenantId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        contact: { select: { firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
    });

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description || '',
      createdAt: activity.createdAt.toISOString(),
      user: activity.user.name || 'Unknown',
      contact: activity.contact 
        ? `${activity.contact.firstName} ${activity.contact.lastName || ''}`.trim()
        : undefined,
      company: activity.company?.name,
    }));

    // Get upcoming tasks
    const upcomingTasksList = await prisma.task.findMany({
      where: {
        tenantId: user.tenantId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now },
      },
      take: 10,
      orderBy: { dueDate: 'asc' },
      include: {
        contact: { select: { firstName: true, lastName: true } },
        deal: { select: { name: true } },
      },
    });

    const formattedTasks = upcomingTasksList.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate?.toISOString() || '',
      priority: task.priority,
      contact: task.contact 
        ? `${task.contact.firstName} ${task.contact.lastName || ''}`.trim()
        : undefined,
      deal: task.deal?.name,
    }));

    // Get team performance (if user can see team data)
    const teamPerformance = await getTeamPerformance(user.tenantId, startDate);

    // Calculate conversion rate
    const totalLeads = await prisma.contact.count({
      where: { 
        tenantId: user.tenantId,
        status: 'LEAD'
      },
    });
    
    const convertedLeads = await prisma.contact.count({
      where: { 
        tenantId: user.tenantId,
        status: { in: ['QUALIFIED', 'OPPORTUNITY', 'CUSTOMER'] }
      },
    });
    
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    return NextResponse.json({
      totalContacts,
      totalCompanies,
      totalDeals,
      totalRevenue: currentRevenue,
      newContacts,
      newDeals,
      closedDeals,
      conversionRate,
      upcomingTasks,
      overdueActivities,
      leadScore: 0, // Placeholder for lead scoring
      
      // Growth metrics
      contactsGrowth,
      revenueGrowth,
      dealsGrowth,
      
      // Stage distributions
      contactsByStage,
      dealsByStage,
      
      // Activity data
      recentActivities: formattedActivities,
      upcomingTasksList: formattedTasks,
      teamPerformance,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get team performance
async function getTeamPerformance(tenantId: string, startDate: Date) {
  const teamUsers = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  const performance = await Promise.all(
    teamUsers.map(async (user) => {
      const [contactsAdded, dealsWon, revenue, activitiesCompleted] = await Promise.all([
        prisma.contact.count({
          where: {
            tenantId,
            assignedTo: user.id,
            createdAt: { gte: startDate },
          },
        }),
        prisma.deal.count({
          where: {
            tenantId,
            assignedTo: user.id,
            stage: 'CLOSED_WON',
            updatedAt: { gte: startDate },
          },
        }),
        prisma.deal.aggregate({
          where: {
            tenantId,
            assignedTo: user.id,
            stage: 'CLOSED_WON',
            updatedAt: { gte: startDate },
          },
          _sum: { value: true },
        }),
        prisma.activity.count({
          where: {
            tenantId,
            userId: user.id,
            isCompleted: true,
            completedAt: { gte: startDate },
          },
        }),
      ]);

      return {
        userId: user.id,
        name: user.name || 'Unknown',
        contactsAdded,
        dealsWon,
        revenue: revenue._sum.value || 0,
        activitiesCompleted,
      };
    })
  );

  return performance.filter(p => 
    p.contactsAdded > 0 || p.dealsWon > 0 || p.activitiesCompleted > 0
  );
}

// Helper function to get stage colors
function getStageColor(status: string): string {
  const colors: Record<string, string> = {
    LEAD: '#3B82F6',
    QUALIFIED: '#10B981',
    OPPORTUNITY: '#F59E0B',
    CUSTOMER: '#059669',
    LOST: '#EF4444',
    ANSWERED: '#8B5CF6',
    NO_ANSWER: '#6B7280',
    SHOW: '#06B6D4',
    NO_SHOW: '#F97316',
    CONTRACT: '#84CC16',
  };
  return colors[status] || '#6B7280';
}

function getDealStageColor(stage: string): string {
  const colors: Record<string, string> = {
    PROSPECTING: '#3B82F6',
    QUALIFICATION: '#8B5CF6',
    PROPOSAL: '#F59E0B',
    NEGOTIATION: '#F97316',
    CLOSED_WON: '#10B981',
    CLOSED_LOST: '#EF4444',
  };
  return colors[stage] || '#6B7280';
} 