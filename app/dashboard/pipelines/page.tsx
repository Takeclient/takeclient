'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface DealStats {
  totalValue: number;
  totalDeals: number;
  averageDealSize: number;
  conversionRate: number;
  stageStats: {
    [stageId: string]: {
      count: number;
      value: number;
    };
  };
}

interface ContactStats {
  totalContacts: number;
  totalStages: number;
  recentActivity: number;
  stageDistribution: {
    [stageId: string]: {
      name: string;
      count: number;
      color: string;
    };
  };
}

interface QuickMetrics {
  totalRevenuePipeline: number;
  totalContactsPipeline: number;
  activePipelines: number;
  conversionRate: number;
}

export default function PipelinesOverviewPage() {
  const [dealStats, setDealStats] = useState<DealStats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [quickMetrics, setQuickMetrics] = useState<QuickMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setIsLoading(true);
      
      const [dealStatsRes, contactStatsRes] = await Promise.all([
        fetch('/api/deals/pipeline/stats').catch(() => null),
        fetch('/api/contacts/pipeline/stats').catch(() => null),
      ]);

      if (dealStatsRes && dealStatsRes.ok) {
        const data = await dealStatsRes.json();
        setDealStats(data);
      }

      if (contactStatsRes && contactStatsRes.ok) {
        const data = await contactStatsRes.json();
        setContactStats(data);
      }

      // Calculate quick metrics
      const metrics: QuickMetrics = {
        totalRevenuePipeline: dealStats?.totalValue || 0,
        totalContactsPipeline: contactStats?.totalContacts || 0,
        activePipelines: 2, // Contact + Deal pipelines
        conversionRate: dealStats?.conversionRate || 0,
      };
      setQuickMetrics(metrics);

    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pipelines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipelines</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales and contact pipelines to track progress and conversions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/dashboard/contacts/new">
            <Button variant="outline">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </Link>
          <Link href="/dashboard/deals/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pipeline Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(dealStats?.totalValue || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Contacts in Pipeline
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contactStats?.totalContacts || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Deals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dealStats?.totalDeals || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Conversion Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPercentage(dealStats?.conversionRate || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Pipeline Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Deal Pipeline</h3>
                  <p className="text-sm text-gray-500">Track deals through sales stages</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/dashboard/deals/pipeline">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Link href="/dashboard/deals/new">
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Deal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {dealStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dealStats.totalValue)}
                    </div>
                    <div className="text-sm text-gray-500">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dealStats.totalDeals}
                    </div>
                    <div className="text-sm text-gray-500">Active Deals</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(dealStats.averageDealSize)}
                  </div>
                  <div className="text-sm text-gray-500">Average Deal Size</div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    href="/dashboard/deals/pipeline"
                    className="flex items-center justify-center text-sm text-red-600 hover:text-red-700"
                  >
                    View Full Pipeline
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No deal data available</p>
                <Link href="/dashboard/deals/new">
                  <Button className="mt-3">Create Your First Deal</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Contact Pipeline Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Contact Pipeline</h3>
                  <p className="text-sm text-gray-500">Manage leads and contact progression</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/dashboard/contacts/kanban">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Link href="/dashboard/contacts/new">
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Contact
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {contactStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {contactStats.totalContacts}
                    </div>
                    <div className="text-sm text-gray-500">Total Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {contactStats.totalStages}
                    </div>
                    <div className="text-sm text-gray-500">Pipeline Stages</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {contactStats.recentActivity || 0}
                  </div>
                  <div className="text-sm text-gray-500">Recent Activities</div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link 
                    href="/dashboard/contacts/kanban"
                    className="flex items-center justify-center text-sm text-red-600 hover:text-red-700"
                  >
                    View Contact Pipeline
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No contact data available</p>
                <Link href="/dashboard/contacts/new">
                  <Button className="mt-3">Add Your First Contact</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-500">Common pipeline management tasks</p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard/deals/pipeline"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Manage Deal Stages</h4>
                <p className="text-sm text-gray-500">Update deal progress and stages</p>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/contacts/kanban"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <UserGroupIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Contact Pipeline</h4>
                <p className="text-sm text-gray-500">Move contacts through sales funnel</p>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/deals/forecast"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Sales Forecast</h4>
                <p className="text-sm text-gray-500">View revenue projections</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Pipeline Performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pipeline Performance</h3>
          <p className="text-sm text-gray-500">Key metrics and insights</p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(dealStats?.conversionRate || 0)}
              </div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
            
            <div className="text-center">
              <ClockIcon className="h-12 w-12 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {dealStats?.averageDealSize ? Math.round(dealStats.averageDealSize / 1000) : 0}k
              </div>
              <div className="text-sm text-gray-500">Avg Deal Size</div>
            </div>
            
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(dealStats?.stageStats || {}).length}
              </div>
              <div className="text-sm text-gray-500">Active Stages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 