import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';

// GET - System statistics (Super admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to view system stats
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get current date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalUsers,
      totalTenants,
      totalForms,
      totalSubmissions,
      recentSignups,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.form.count(),
      prisma.formSubmission.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneWeekAgo,
          },
        },
      }),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: oneWeekAgo,
          },
        },
      }),
    ]);

    // Get plan distribution with revenue
    const planDistribution = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            tenants: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const planStats = planDistribution.map(plan => ({
      planName: plan.displayName,
      count: plan._count.tenants,
      revenue: plan.price * plan._count.tenants, // Monthly revenue
    }));

    // Get recent activity from audit logs
    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    const activityList = recentActivity.map(log => ({
      type: log.action,
      description: formatActivityDescription(log),
      timestamp: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalUsers,
      totalTenants,
      totalForms,
      totalSubmissions,
      activeUsers,
      recentSignups,
      planDistribution: planStats,
      recentActivity: activityList,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to format activity descriptions
function formatActivityDescription(log: any): string {
  const userName = log.user?.name || log.user?.email || 'Unknown user';
  const tenantName = log.tenant?.name || 'Unknown tenant';
  
  switch (log.action) {
    case 'CREATE_USER':
      return `${userName} created a new user`;
    case 'UPDATE_USER':
      return `${userName} updated a user`;
    case 'DELETE_USER':
      return `${userName} deleted a user`;
    case 'CREATE_TENANT':
      return `${userName} created tenant: ${tenantName}`;
    case 'UPDATE_TENANT':
      return `${userName} updated tenant: ${tenantName}`;
    case 'DELETE_TENANT':
      return `${userName} deleted tenant: ${tenantName}`;
    case 'LOGIN':
      return `${userName} logged in`;
    case 'PERMISSION_CHANGE':
      return `${userName} changed user permissions`;
    case 'SYSTEM_CONFIG_CHANGE':
      return `${userName} updated system configuration`;
    default:
      return `${userName} performed ${log.action.toLowerCase().replace('_', ' ')}`;
  }
} 