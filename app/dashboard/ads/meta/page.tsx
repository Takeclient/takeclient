'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, CogIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, ExclamationTriangleIcon, LightBulbIcon, BoltIcon } from '@heroicons/react/24/outline';
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

interface AIInsight {
  id: string;
  type: 'optimization' | 'budget_alert' | 'audience' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  campaignId?: string;
  actionable: boolean;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function MetaAdsPage() {
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [adAccounts, setAdAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
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

  // AI Agent Mock Data for Meta Ads
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'budget_alert',
      title: 'Budget Alert: Brand Awareness Campaign',
      description: 'This campaign has spent 41% of its budget in the first week. Current spending rate is higher than optimal for the campaign duration.',
      impact: 'high',
      campaignId: '1',
      actionable: true,
      createdAt: '2024-01-20T11:30:00Z'
    },
    {
      id: '2',
      type: 'audience',
      title: 'Audience Optimization Opportunity',
      description: 'Women aged 25-34 show 85% higher conversion rates. Consider creating a separate ad set targeting this demographic.',
      impact: 'high',
      campaignId: '2',
      actionable: true,
      createdAt: '2024-01-20T10:15:00Z'
    },
    {
      id: '3',
      type: 'optimization',
      title: 'Creative Performance Analysis',
      description: 'Video ads perform 120% better than image ads in your Holiday Sales campaign. Consider shifting budget allocation.',
      impact: 'medium',
      campaignId: '3',
      actionable: true,
      createdAt: '2024-01-20T09:45:00Z'
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Lookalike Audience Suggestion',
      description: 'Create a 2% lookalike audience based on your top converting customers to expand reach for Lead Generation campaign.',
      impact: 'medium',
      campaignId: '2',
      actionable: true,
      createdAt: '2024-01-19T14:20:00Z'
    }
  ]);

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Handle OAuth callback and authentication
  useEffect(() => {
    const handleAuthCallback = async () => {
      const authSuccess = searchParams.get('auth');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const token = searchParams.get('access_token');
      const userName = searchParams.get('user');

      if (error) {
        setAuthError(errorDescription || 'Authentication failed');
        return;
      }

      if (authSuccess === 'success') {
        console.log('Meta authentication successful:', { userName, hasToken: !!token });
        setIsConnected(true);
        
        if (token) {
          setAccessToken(token);
          await loadAdAccounts(token);
        }
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard/ads/meta');
      }
    };

    handleAuthCallback();
  }, [searchParams]);

  const loadAdAccounts = async (token?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/meta-ads/accounts${token ? `?access_token=${token}` : ''}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const accounts = await response.json();
        setAdAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0].id);
          await loadCampaigns(accounts[0].id, token);
        }
      }
    } catch (error) {
      console.error('Error loading ad accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCampaigns = async (accountId: string, token?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/meta-ads/accounts/${accountId}/campaigns${token ? `?access_token=${token}` : ''}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.campaigns) {
          // Convert Meta campaigns to our Campaign interface
          const convertedCampaigns = data.campaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            objective: campaign.objective,
            status: campaign.status === 'ACTIVE' ? 'Active' : campaign.status === 'PAUSED' ? 'Paused' : 'Completed',
            budget: parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100, // Convert cents to dollars
            spent: 0, // Will be loaded from insights
            reach: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpm: 0,
            startDate: campaign.start_time ? new Date(campaign.start_time).toISOString().split('T')[0] : '',
            endDate: campaign.stop_time ? new Date(campaign.stop_time).toISOString().split('T')[0] : undefined
          }));
          setCampaigns(convertedCampaigns);
        }
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/meta-ads/auth`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.oauth_url) {
          // Redirect to Meta OAuth
          window.location.href = data.oauth_url;
        } else {
          setAuthError('Failed to get OAuth URL');
        }
      } else {
        setAuthError('Failed to initiate authentication');
      }
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setAuthError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    alert('Configuration saved! (Mock)');
  };

  const generateAIInsights = async () => {
    if (!selectedAccount) return;
    
    setIsGeneratingInsights(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/meta-ads/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_account_id: selectedAccount,
          campaign_ids: campaigns.map(c => c.id),
          objective: 'CONVERSIONS'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Convert AI insights to our format
          const newInsights = data.insights.map((insight: any) => ({
            id: Date.now().toString() + Math.random(),
            type: insight.type === 'performance_insight' ? 'optimization' : 'recommendation',
            title: insight.title,
            description: insight.description,
            impact: insight.impact,
            campaignId: insight.campaign_id,
            actionable: true,
            createdAt: new Date().toISOString()
          }));
          
          setAIInsights(prev => [...newInsights, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to demo insight
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'optimization',
        title: 'AI-Generated Meta Campaign Optimization',
        description: 'Based on recent performance data, consider using automatic placements across Facebook, Instagram, and Audience Network. This could increase reach by 35% while maintaining cost efficiency.',
        impact: 'high',
        campaignId: campaigns[0]?.id || '1',
        actionable: true,
        createdAt: new Date().toISOString()
      };
      
      setAIInsights(prev => [newInsight, ...prev]);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const dismissInsight = (insightId: string) => {
    setAIInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'audience':
        return <LightBulbIcon className="h-5 w-5" />;
      case 'optimization':
        return <BoltIcon className="h-5 w-5" />;
      case 'recommendation':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <SparklesIcon className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'budget_alert') return 'bg-red-100 text-red-800 border-red-200';
    if (impact === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (impact === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
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
            <div className="flex flex-col items-end">
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Connecting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plug mr-2"></i>
                    Connect Account
                  </>
                )}
              </button>
              {authError && (
                <p className="text-red-600 text-sm mt-2 max-w-xs text-right">{authError}</p>
              )}
            </div>
          )}
          
          {isConnected && adAccounts.length > 0 && (
            <div className="flex items-center space-x-4">
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  loadCampaigns(e.target.value, accessToken || undefined);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {adAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {adAccounts.find(acc => acc.id === selectedAccount)?.business_name}
              </span>
            </div>
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
            <SparklesIcon className="h-4 w-4 mr-2 inline" />
            AI Assistant
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

          {/* AI Assistant Tab */}
          <Tab.Panel>
            {isConnected ? (
              <div className="space-y-6">
                {/* Header with action button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Campaign Assistant</h2>
                    <p className="text-gray-600 mt-1">Get AI-powered insights, recommendations, and alerts for your Meta Ads campaigns</p>
                  </div>
                  <button
                    onClick={generateAIInsights}
                    disabled={isGeneratingInsights}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isGeneratingInsights ? 'Generating...' : 'Generate New Insights'}
                  </button>
                </div>

                {/* AI Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aiInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`border rounded-lg p-6 ${getInsightColor(insight.type, insight.impact)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                            <p className="text-sm mb-4">{insight.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs font-medium uppercase tracking-wide">
                                  {insight.type.replace('_', ' ')}
                                </span>
                                <span className="text-xs">
                                  Impact: {insight.impact}
                                </span>
                                {insight.campaignId && (
                                  <span className="text-xs">
                                    Campaign: {campaigns.find(c => c.id === insight.campaignId)?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissInsight(insight.id)}
                          className="text-gray-400 hover:text-gray-600 ml-4"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {insight.actionable && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex space-x-3">
                            <button className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                              Apply Suggestion
                            </button>
                            <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                              Learn More
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Features Overview for Meta */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant Features for Meta Ads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <BoltIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Campaign Optimization</h4>
                      <p className="text-sm text-gray-600 mt-1">AI analyzes creative performance and placements</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Budget Alerts</h4>
                      <p className="text-sm text-gray-600 mt-1">Monitor spending across Facebook and Instagram</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <LightBulbIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Audience Insights</h4>
                      <p className="text-sm text-gray-600 mt-1">Discover high-performing audience segments</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
                      <p className="text-sm text-gray-600 mt-1">AI-powered suggestions for Meta campaigns</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions for Meta */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick AI Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <BoltIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Optimize Placements</span>
                      </div>
                      <p className="text-sm text-gray-600">Analyze performance across Facebook, Instagram, and Audience Network</p>
                    </button>
                    
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Audience Research</span>
                      </div>
                      <p className="text-sm text-gray-600">Find new audiences and create lookalikes</p>
                    </button>
                    
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Creative Analysis</span>
                      </div>
                      <p className="text-sm text-gray-600">Compare video vs image performance</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant Unavailable</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your Meta Ads account to access AI-powered campaign optimization, budget alerts, and audience recommendations.
                </p>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <i className="fas fa-plug mr-2"></i>
                  Connect Meta Ads Account
                </button>
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