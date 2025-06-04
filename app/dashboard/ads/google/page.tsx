'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, CogIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  startDate: string;
  endDate?: string;
}

export default function GoogleAdsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale Campaign',
      status: 'Active',
      budget: 5000,
      spent: 2345.67,
      impressions: 123456,
      clicks: 6789,
      conversions: 123,
      ctr: 5.5,
      cpc: 0.35,
      startDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Brand Awareness Q1',
      status: 'Paused',
      budget: 3000,
      spent: 2987.45,
      impressions: 234567,
      clicks: 8901,
      conversions: 89,
      ctr: 3.8,
      cpc: 0.34,
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    },
    {
      id: '3',
      name: 'Product Launch',
      status: 'Active',
      budget: 10000,
      spent: 4567.89,
      impressions: 345678,
      clicks: 12345,
      conversions: 234,
      ctr: 3.6,
      cpc: 0.37,
      startDate: '2024-02-01'
    }
  ]);

  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    customerId: '',
    developerToken: ''
  });

  const handleConnect = () => {
    // Mock OAuth flow
    alert('This would redirect to Google OAuth. For now, we\'ll simulate a connection.');
    setIsConnected(true);
  };

  const handleSaveConfig = () => {
    alert('Configuration saved! (Mock)');
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/ads" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Ads Management
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fa-brands fa-google text-4xl mr-4"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Ads</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
          {!isConnected && (
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <i className="fas fa-plug mr-2"></i>
              Connect Account
            </button>
          )}
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-red-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-red-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            Campaigns
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-red-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-red-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            Analytics
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-red-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-red-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            Configuration
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Campaigns Tab */}
          <Tab.Panel>
            {isConnected ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">All Campaigns</h2>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Campaign
                  </button>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget / Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Impressions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CTR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conversions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">
                              {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${campaign.budget.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">${campaign.spent.toLocaleString()}</div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-red-600 h-1.5 rounded-full"
                                style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              {campaign.ctr}%
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${campaign.cpc}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.conversions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-600 hover:text-gray-900">
                                <ChartBarIcon className="h-5 w-5" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <i className="fa-brands fa-google text-8xl text-gray-300 mb-6"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Google Ads Account</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your Google Ads account to manage campaigns, view analytics, and optimize your advertising directly from this dashboard.
                </p>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-plug mr-2"></i>
                  Connect Google Ads Account
                </button>
              </div>
            )}
          </Tab.Panel>

          {/* Analytics Tab */}
          <Tab.Panel>
            {isConnected ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Spend</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">$9,900.01</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">15.3% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">4.3%</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">-2.1% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Avg. CPC</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">$0.35</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">3.2% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">446</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">28.7% from last month</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Connect your Google Ads account to view analytics</p>
              </div>
            )}
          </Tab.Panel>

          {/* Configuration Tab */}
          <Tab.Panel>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Google Ads API Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Your Google Ads Client ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={config.clientSecret}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Your Google Ads Client Secret"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Developer Token
                    </label>
                    <input
                      type="text"
                      value={config.developerToken}
                      onChange={(e) => setConfig({ ...config, developerToken: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Your Developer Token"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer ID
                    </label>
                    <input
                      type="text"
                      value={config.customerId}
                      onChange={(e) => setConfig({ ...config, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="123-456-7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refresh Token
                    </label>
                    <input
                      type="password"
                      value={config.refreshToken}
                      onChange={(e) => setConfig({ ...config, refreshToken: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Your Refresh Token"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Generate this token using the OAuth Playground after authentication
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Create a Google Ads developer account</li>
                      <li>Create a new project in Google Cloud Console</li>
                      <li>Enable the Google Ads API</li>
                      <li>Create OAuth 2.0 credentials</li>
                      <li>Use the OAuth Playground to generate a refresh token</li>
                      <li>Enter all credentials above and save</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 