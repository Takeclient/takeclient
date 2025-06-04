'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon, ChartBarIcon, ViewColumnsIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface AdPlatform {
  name: string;
  icon: string;
  connected: boolean;
  campaigns: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  href: string;
}

export default function AdsManagementPage() {
  const [platforms, setPlatforms] = useState<AdPlatform[]>([
    {
      name: 'Google Ads',
      icon: 'fa-brands fa-google',
      connected: false,
      campaigns: 12,
      spend: 4567.89,
      impressions: 234567,
      clicks: 12345,
      conversions: 234,
      ctr: 5.26,
      cpc: 0.37,
      href: '/dashboard/ads/google'
    },
    {
      name: 'Meta Ads',
      icon: 'fa-brands fa-facebook',
      connected: false,
      campaigns: 8,
      spend: 3456.78,
      impressions: 345678,
      clicks: 23456,
      conversions: 456,
      ctr: 6.78,
      cpc: 0.15,
      href: '/dashboard/ads/meta'
    }
  ]);

  const [totalMetrics, setTotalMetrics] = useState({
    spend: 8024.67,
    impressions: 580245,
    clicks: 35801,
    conversions: 690,
    ctr: 6.17,
    cpc: 0.22,
    roas: 4.2
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ads Management</h1>
        <p className="text-gray-600">Manage and monitor your advertising campaigns across multiple platforms</p>
      </div>

      {/* Total Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalMetrics.spend.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">12.5% from last month</span>
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{(totalMetrics.impressions / 1000).toFixed(1)}K</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">8.3% from last month</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ViewColumnsIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalMetrics.conversions}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">23.1% from last month</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROAS</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalMetrics.roas.toFixed(1)}x</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2.3% from last month</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <i className={`${platform.icon} text-3xl mr-3`}></i>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{platform.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    platform.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {platform.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
              <Link
                href={platform.href}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {platform.connected ? 'Manage' : 'Connect'}
              </Link>
            </div>

            {platform.connected ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-lg font-semibold text-gray-900">{platform.campaigns}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Spend</p>
                    <p className="text-lg font-semibold text-gray-900">${platform.spend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CTR</p>
                    <p className="text-lg font-semibold text-gray-900">{platform.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. CPC</p>
                    <p className="text-lg font-semibold text-gray-900">${platform.cpc}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Conversions this month</span>
                    <span className="font-semibold text-gray-900">{platform.conversions}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <i className={`${platform.icon} text-5xl text-gray-300 mb-4`}></i>
                <p className="text-gray-600 mb-4">Connect your {platform.name} account to start managing campaigns</p>
                <Link
                  href={platform.href}
                  className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <i className="fas fa-plug mr-2"></i>
                  Connect Account
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center">
              <i className="fa-brands fa-google text-xl mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Summer Sale Campaign</p>
                <p className="text-sm text-gray-600">Google Ads • Started 3 days ago</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center">
              <i className="fa-brands fa-facebook text-xl mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Brand Awareness Campaign</p>
                <p className="text-sm text-gray-600">Meta Ads • Paused 1 day ago</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Paused
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <i className="fa-brands fa-google text-xl mr-3"></i>
              <div>
                <p className="font-medium text-gray-900">Product Launch Campaign</p>
                <p className="text-sm text-gray-600">Google Ads • Ended 1 week ago</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 