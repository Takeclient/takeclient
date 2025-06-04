'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ForecastData {
  currentMonth: {
    target: number;
    actual: number;
    projected: number;
    deals: number;
  };
  currentQuarter: {
    target: number;
    actual: number;
    projected: number;
    deals: number;
  };
  pipeline: {
    weighted: number;
    unweighted: number;
    bestCase: number;
    worstCase: number;
  };
  trends: {
    monthlyGrowth: number;
    quarterlyGrowth: number;
    conversionRate: number;
    averageDealSize: number;
  };
  upcomingDeals: Array<{
    id: string;
    name: string;
    value: number;
    probability: number;
    closeDate: string;
    stage: string;
    company?: { name: string };
  }>;
  riskDeals: Array<{
    id: string;
    name: string;
    value: number;
    probability: number;
    closeDate: string;
    stage: string;
    riskReason: string;
    company?: { name: string };
  }>;
}

interface ForecastFilters {
  period: 'month' | 'quarter' | 'year';
  team: string;
  product: string;
}

export default function SalesForecastPage() {
  const { data: session } = useSession();
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ForecastFilters>({
    period: 'month',
    team: '',
    product: '',
  });

  useEffect(() => {
    loadForecastData();
  }, [filters]);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/deals/forecast?${params}`);
      if (response.ok) {
        const data = await response.json();
        setForecastData(data);
      } else {
        toast.error('Failed to load forecast data');
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
      toast.error('Failed to load forecast data');
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getProgressPercentage = (actual: number, target: number) => {
    return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysUntilClose = (closeDate: string) => {
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (!forecastData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-7 w-7 text-blue-600 mr-3" />
              Sales Forecast
            </h1>
            <p className="text-gray-600 mt-1">
              Track performance against targets and predict future revenue
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value as 'month' | 'quarter' | 'year' })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team
            </label>
            <select
              value={filters.team}
              onChange={(e) => setFilters({ ...filters, team: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              <option value="enterprise">Enterprise</option>
              <option value="smb">SMB</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              <option value="software">Software</option>
              <option value="consulting">Consulting</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Month Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Monthly Target</h3>
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(forecastData.currentMonth.actual)}
              </span>
              <span className="text-sm text-gray-500">
                / {formatCurrency(forecastData.currentMonth.target)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(
                  getProgressPercentage(forecastData.currentMonth.actual, forecastData.currentMonth.target)
                )}`}
                style={{
                  width: `${getProgressPercentage(forecastData.currentMonth.actual, forecastData.currentMonth.target)}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {getProgressPercentage(forecastData.currentMonth.actual, forecastData.currentMonth.target).toFixed(1)}% of target
            </p>
          </div>
        </div>

        {/* Quarterly Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Quarterly Target</h3>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(forecastData.currentQuarter.actual)}
              </span>
              <span className="text-sm text-gray-500">
                / {formatCurrency(forecastData.currentQuarter.target)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(
                  getProgressPercentage(forecastData.currentQuarter.actual, forecastData.currentQuarter.target)
                )}`}
                style={{
                  width: `${getProgressPercentage(forecastData.currentQuarter.actual, forecastData.currentQuarter.target)}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {getProgressPercentage(forecastData.currentQuarter.actual, forecastData.currentQuarter.target).toFixed(1)}% of target
            </p>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Weighted Pipeline</h3>
            <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(forecastData.pipeline.weighted)}
            </span>
            <p className="text-sm text-gray-600">
              Unweighted: {formatCurrency(forecastData.pipeline.unweighted)}
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-green-600">Best: {formatCurrency(forecastData.pipeline.bestCase)}</span>
              <span className="text-red-600">Worst: {formatCurrency(forecastData.pipeline.worstCase)}</span>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Growth Trends</h3>
            <ArrowUpIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly</span>
              <span className={`text-sm font-medium ${
                forecastData.trends.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(forecastData.trends.monthlyGrowth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quarterly</span>
              <span className={`text-sm font-medium ${
                forecastData.trends.quarterlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(forecastData.trends.quarterlyGrowth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion</span>
              <span className="text-sm font-medium text-gray-900">
                {forecastData.trends.conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deals & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upcoming Deals */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              Upcoming Closes ({forecastData.upcomingDeals.length})
            </h2>
          </div>
          <div className="p-6">
            {forecastData.upcomingDeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming deals</p>
            ) : (
              <div className="space-y-4">
                {forecastData.upcomingDeals.slice(0, 5).map((deal) => {
                  const daysUntilClose = getDaysUntilClose(deal.closeDate);
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{deal.name}</h4>
                        <p className="text-sm text-gray-600">
                          {deal.company?.name} • {deal.stage}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {deal.probability}% probability
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          daysUntilClose <= 7 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {daysUntilClose} days
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(deal.closeDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              At-Risk Deals ({forecastData.riskDeals.length})
            </h2>
          </div>
          <div className="p-6">
            {forecastData.riskDeals.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No at-risk deals</p>
            ) : (
              <div className="space-y-4">
                {forecastData.riskDeals.slice(0, 5).map((deal) => {
                  const daysUntilClose = getDaysUntilClose(deal.closeDate);
                  return (
                    <div key={deal.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{deal.name}</h4>
                        <p className="text-sm text-gray-600">
                          {deal.company?.name} • {deal.stage}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Risk: {deal.riskReason}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {deal.probability}% probability
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600">
                          {daysUntilClose} days
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(deal.closeDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Forecast Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(forecastData.currentMonth.projected)}
            </div>
            <div className="text-sm text-gray-600">Projected Monthly Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {forecastData.currentMonth.deals} active deals
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatCurrency(forecastData.currentQuarter.projected)}
            </div>
            <div className="text-sm text-gray-600">Projected Quarterly Revenue</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {forecastData.currentQuarter.deals} active deals
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(forecastData.trends.averageDealSize)}
            </div>
            <div className="text-sm text-gray-600">Average Deal Size</div>
            <div className="text-xs text-gray-500 mt-1">
              Across all active opportunities
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 