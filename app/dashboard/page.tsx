'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  PlusIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalRevenue: number;
  newContacts: number;
  newDeals: number;
  closedDeals: number;
  conversionRate: number;
  upcomingTasks: number;
  overdueActivities: number;
  leadScore: number;
  
  // Growth metrics
  contactsGrowth: number;
  revenueGrowth: number;
  dealsGrowth: number;
  
  // Stage distribution
  contactsByStage: Array<{
    stage: string;
    count: number;
    color: string;
  }>;
  
  dealsByStage: Array<{
    stage: string;
    count: number;
    value: number;
    color: string;
  }>;
  
  // Recent activities
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    user: string;
    contact?: string;
    company?: string;
  }>;
  
  // Upcoming tasks
  upcomingTasksList: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    contact?: string;
    deal?: string;
  }>;
  
  // Performance metrics
  teamPerformance: Array<{
    userId: string;
    name: string;
    contactsAdded: number;
    dealsWon: number;
    revenue: number;
    activitiesCompleted: number;
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30'); // days

  const loadDashboardStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/stats?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const metricCards = [
    {
      name: 'Total Contacts',
      value: stats?.totalContacts || 0,
      growth: stats?.contactsGrowth || 0,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/contacts',
    },
    {
      name: 'Total Companies',
      value: stats?.totalCompanies || 0,
      growth: 0,
      icon: BuildingOfficeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/companies',
    },
    {
      name: 'Active Deals',
      value: stats?.totalDeals || 0,
      growth: stats?.dealsGrowth || 0,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/dashboard/deals',
    },
    {
      name: 'Total Revenue',
      value: `$${((stats?.totalRevenue || 0) / 100).toLocaleString()}`,
      growth: stats?.revenueGrowth || 0,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/deals',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 text-sm">
            Let&apos;s get started with your business growth
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Link
            href="/dashboard/contacts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <Link key={metric.name} href={metric.href}>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${metric.bgColor} rounded-md p-3`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {metric.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metric.value}
                        </div>
                        {metric.growth !== 0 && (
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${getGrowthColor(metric.growth)}`}>
                            {getGrowthIcon(metric.growth)}
                            <span className="ml-1">
                              {Math.abs(metric.growth)}%
                            </span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Pipeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Pipeline</h3>
            <Link href="/dashboard/contacts" className="text-red-600 hover:text-red-700 text-sm font-medium">
              View all <ArrowRightIcon className="h-4 w-4 inline ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.contactsByStage?.map((stage, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-3"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{stage.stage}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stage.count}</span>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No pipeline data available</p>
            )}
          </div>
        </div>

        {/* Deal Pipeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Deal Pipeline</h3>
            <Link href="/dashboard/deals" className="text-red-600 hover:text-red-700 text-sm font-medium">
              View all <ArrowRightIcon className="h-4 w-4 inline ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.dealsByStage?.map((stage, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-3"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{stage.stage}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stage.count}</div>
                  <div className="text-xs text-gray-500">${(stage.value / 100).toLocaleString()}</div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No pipeline data available</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/contacts/new" className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
              <UserGroupIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Add New Contact</span>
            </Link>
            <Link href="/dashboard/companies/new" className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
              <BuildingOfficeIcon className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Add New Company</span>
            </Link>
            <Link href="/dashboard/deals/new" className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Create New Deal</span>
            </Link>
            <button className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors w-full text-left">
              <PhoneIcon className="h-5 w-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-gray-900">Log Activity</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.recentActivities?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-8">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.upcomingTasksList?.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500 text-center py-8">No upcoming tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {stats?.teamPerformance && stats.teamPerformance.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Team Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deals Won
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activities
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.teamPerformance.map((member) => (
                  <tr key={member.userId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.contactsAdded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.dealsWon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(member.revenue / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.activitiesCompleted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
