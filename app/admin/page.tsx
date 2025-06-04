'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface DashboardStats {
  totalTenants: number;
  totalUsers: number;
  activePlans: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  newTenantsThisMonth: number;
  newUsersThisMonth: number;
  planDistribution: {
    name: string;
    count: number;
    revenue: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    resource: string;
    user: string;
    timestamp: string;
  }[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Error loading dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Tenants',
      value: stats?.totalTenants || 0,
      change: stats?.newTenantsThisMonth || 0,
      changeLabel: 'new this month',
      icon: BuildingOfficeIcon,
      href: '/admin/tenants',
      color: 'bg-blue-500',
    },
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.newUsersThisMonth || 0,
      changeLabel: 'new this month',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-green-500',
    },
    {
      name: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      change: null,
      icon: CreditCardIcon,
      href: '/admin/subscriptions',
      color: 'bg-purple-500',
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      change: stats?.revenueGrowth || 0,
      changeLabel: '% vs last month',
      icon: CurrencyDollarIcon,
      href: '/admin/analytics',
      color: 'bg-red-500',
    },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {session?.user?.name || 'Admin'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/plans/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Plan
            </Link>
            <Link
              href="/admin/users/invite"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Invite User
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    {stat.change !== null && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        {stat.change > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : stat.change < 0 ? (
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : null}
                        {Math.abs(stat.change)} {stat.changeLabel}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Plan Distribution
            </h2>
            <div className="space-y-3">
              {stats?.planDistribution?.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {plan.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {plan.count} tenants
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${(plan.count / (stats?.totalTenants || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(plan.revenue)}
                    </p>
                    <p className="text-xs text-gray-500">monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <Link
                href="/admin/audit-logs"
                className="text-sm text-red-600 hover:text-red-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentActivity?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action} {activity.resource}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/system-config"
              className="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">System Config</p>
            </Link>
            <Link
              href="/admin/analytics"
              className="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Analytics</p>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <DocumentTextIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Audit Logs</p>
            </Link>
            <Link
              href="/admin/plans"
              className="text-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <CreditCardIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Plans</p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 