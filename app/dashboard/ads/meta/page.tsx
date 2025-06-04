'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, CogIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: 'Active' | 'Paused' | 'Completed';
  budget: number;
  spent: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  startDate: string;
  endDate?: string;
}

export default function MetaAdsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Brand Awareness Campaign',
      objective: 'Brand Awareness',
      status: 'Active',
      budget: 3000,
      spent: 1234.56,
      reach: 45678,
      impressions: 234567,
      clicks: 12345,
      conversions: 234,
      ctr: 5.26,
      cpm: 5.26,
      startDate: '2024-01-20'
    },
    {
      id: '2',
      name: 'Lead Generation Q1',
      objective: 'Lead Generation',
      status: 'Active',
      budget: 5000,
      spent: 3456.78,
      reach: 67890,
      impressions: 345678,
      clicks: 23456,
      conversions: 456,
      ctr: 6.78,
      cpm: 10.00,
      startDate: '2024-01-01'
    },
    {
      id: '3',
      name: 'Holiday Sales',
      objective: 'Conversions',
      status: 'Completed',
      budget: 8000,
      spent: 7890.12,
      reach: 123456,
      impressions: 456789,
      clicks: 34567,
      conversions: 789,
      ctr: 7.56,
      cpm: 17.26,
      startDate: '2023-12-01',
      endDate: '2023-12-31'
    }
  ]);

  const [config, setConfig] = useState({
    appId: '',
    appSecret: '',
    accessToken: '',
    adAccountId: '',
    pixelId: ''
  });

  const handleConnect = () => {
    // Mock OAuth flow
    alert('This would redirect to Facebook OAuth. For now, we\'ll simulate a connection.');
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
            <i className="fa-brands fa-facebook text-4xl mr-4 text-blue-600"></i>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meta Ads</h1>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
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
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
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
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
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
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                          Reach
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Impressions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CTR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CPM
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
                              {campaign.objective} • {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
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
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.reach.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              {campaign.ctr}%
                              {campaign.ctr > 5 ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${campaign.cpm.toFixed(2)}
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
                <i className="fa-brands fa-facebook text-8xl text-blue-300 mb-6"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Meta Ads Account</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your Meta (Facebook) Ads account to manage campaigns, view analytics, and optimize your social media advertising.
                </p>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-plug mr-2"></i>
                  Connect Meta Ads Account
                </button>
              </div>
            )}
          </Tab.Panel>

          {/* Analytics Tab */}
          <Tab.Panel>
            {isConnected ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Performance Metrics */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">$12,581.46</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">18.2% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Reach</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">237K</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">25.4% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Avg. CPM</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">$10.84</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">-5.2% from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">1,479</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">32.8% from last month</span>
                    </div>
                  </div>
                </div>

                {/* Audience Demographics */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Demographics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Age Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">18-24</span>
                          <span className="text-sm font-medium">22%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">25-34</span>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">35-44</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">45+</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Gender</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Male</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Female</span>
                          <span className="text-sm font-medium">53%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Other</span>
                          <span className="text-sm font-medium">2%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Top Locations</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">United States</span>
                          <span className="text-sm font-medium">42%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">United Kingdom</span>
                          <span className="text-sm font-medium">18%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Canada</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Australia</span>
                          <span className="text-sm font-medium">12%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Connect your Meta Ads account to view analytics</p>
              </div>
            )}
          </Tab.Panel>

          {/* Configuration Tab */}
          <Tab.Panel>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Meta Ads API Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App ID
                    </label>
                    <input
                      type="text"
                      value={config.appId}
                      onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Facebook App ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      App Secret
                    </label>
                    <input
                      type="password"
                      value={config.appSecret}
                      onChange={(e) => setConfig({ ...config, appSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Facebook App Secret"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={config.accessToken}
                      onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Access Token"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Long-lived access token with ads_management permission
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Account ID
                    </label>
                    <input
                      type="text"
                      value={config.adAccountId}
                      onChange={(e) => setConfig({ ...config, adAccountId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="act_123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={config.pixelId}
                      onChange={(e) => setConfig({ ...config, pixelId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Facebook Pixel ID"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSaveConfig}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Create a Facebook App in Meta for Developers</li>
                      <li>Add Facebook Login and Marketing API products</li>
                      <li>Generate a long-lived access token with ads_management permission</li>
                      <li>Create or select an Ad Account</li>
                      <li>Install Facebook Pixel on your website</li>
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