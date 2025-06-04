'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalUsers: number;
  totalTenants: number;
  totalForms: number;
  totalSubmissions: number;
  activeUsers: number;
  recentSignups: number;
  planDistribution: Array<{
    planName: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `+${stats?.recentSignups || 0} this week`,
    },
    {
      name: 'Total Tenants',
      value: stats?.totalTenants || 0,
      icon: BuildingOfficeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: 'Active organizations',
    },
    {
      name: 'Total Forms',
      value: stats?.totalForms || 0,
      icon: DocumentTextIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Created by users',
    },
    {
      name: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'Form submissions',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System overview and platform statistics
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className={`absolute ${stat.bgColor} rounded-md p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                <span className="ml-1 text-xs text-gray-500">{stat.change}</span>
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Distribution */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Plan Distribution
            </h3>
            <div className="space-y-4">
              {stats?.planDistribution.map((plan) => (
                <div key={plan.planName} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {plan.planName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {plan.count} tenant{plan.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${(plan.revenue / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Monthly</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No plan data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-gray-400 mt-2"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors">
                Create User
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-md transition-colors">
                Add Tenant
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded-md transition-colors">
                View Logs
              </button>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-2 px-4 rounded-md transition-colors">
                System Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 