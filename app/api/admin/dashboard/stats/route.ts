import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { hasPermission, Permission } from '@/app/lib/permissions';

interface ExtendedUser {
  role?: string;
  id?: string;
  email?: string;
  name?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as ExtendedUser)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as ExtendedUser;
    
    // Check if user has permission to view system stats
    if (!hasPermission(user.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get current date info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch basic counts
    const totalTenants = await prisma.tenant.count();
    const totalUsers = await prisma.user.count();
    const activePlans = await prisma.plan.count({ where: { isActive: true } });
    const activeSubscriptions = await prisma.subscription.count({ 
      where: { status: { in: ['ACTIVE', 'TRIALING'] } } 
    });

    // New this month
    const newTenantsThisMonth = await prisma.tenant.count({
      where: { createdAt: { gte: startOfMonth } }
    });
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    // Get all active plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Get plan distribution
    const planDistribution = await Promise.all(
      plans.map(async (plan) => {
        const tenantCount = await prisma.tenant.count({
          where: { planId: plan.id }
        });
        
        // For now, calculate revenue based on plan price * tenant count
        // In production, this would come from actual subscription data
        const monthlyRevenue = plan.price * tenantCount;
        
        return {
          name: plan.displayName,
          count: tenantCount,
          revenue: monthlyRevenue
        };
      })
    );

    // Calculate total monthly revenue
    const monthlyRevenue = planDistribution.reduce((sum, plan) => sum + plan.revenue, 0);
    
    // For demo purposes, show 15% growth
    const revenueGrowth = 15;

    // Get recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Format recent activity
    const recentActivity = recentLogs.map(log => ({
      id: log.id,
      action: log.action.replace(/_/g, ' ').toLowerCase(),
      resource: log.resource,
      user: log.user?.name || log.user?.email || 'System',
      timestamp: log.createdAt.toISOString()
    }));

    return NextResponse.json({
      totalTenants,
      totalUsers,
      activePlans,
      activeSubscriptions,
      monthlyRevenue,
      revenueGrowth,
      newTenantsThisMonth,
      newUsersThisMonth,
      planDistribution,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 