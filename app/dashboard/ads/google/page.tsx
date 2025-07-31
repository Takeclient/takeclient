'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, ChartBarIcon, CogIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, ExclamationTriangleIcon, LightBulbIcon, BoltIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { googleAdsAPI, Campaign, AIInsight, Customer } from '@/lib/api/google-ads';
import { formatCurrency, getCurrencyName } from '@/lib/utils/currency';

export default function GoogleAdsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // AI Agent Data
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<any>(null);

  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load customers when connected
  useEffect(() => {
    if (isConnected) {
      loadCustomers();
    }
  }, [isConnected]);

  // Load campaigns when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      loadCampaigns();
      loadAIInsights();
      loadPerformanceSummary();
    }
  }, [selectedCustomer]);

  // Check URL parameters for OAuth callback results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const errorParam = urlParams.get('error');

    if (connected === 'true') {
      setIsConnected(true);
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/ads/google');
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard/ads/google');
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if client is properly initialized and has refresh token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/google-ads/status`);
      const statusData = await response.json();
      
      if (response.ok) {
        const isFullyAuthenticated = statusData.client_initialized && statusData.has_refresh_token && statusData.developer_token_configured;
        setIsConnected(isFullyAuthenticated);
        
        if (isFullyAuthenticated) {
          // Load customers if authenticated
          loadCustomers();
        } else if (!statusData.developer_token_configured) {
          setError('Google Ads Developer Token not configured');
        } else if (!statusData.has_refresh_token) {
          setError('Authentication required - please connect your Google Ads account');
        }
      } else {
        console.error('Failed to check authentication status');
      }
    } catch (err) {
      console.error('Auth status check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const { auth_url } = await googleAdsAPI.getAuthUrl();
      window.location.href = auth_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Google Ads authentication';
      setError(errorMessage);
      console.error('Google Ads connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { customers } = await googleAdsAPI.getAccessibleCustomers();
      setCustomers(customers);
    } catch (err) {
      setError('Failed to load Google Ads accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      const { campaigns } = await googleAdsAPI.getCampaigns(selectedCustomer.id);
      setCampaigns(campaigns);
    } catch (err) {
      setError('Failed to load campaigns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    if (!selectedCustomer) return;
    
    try {
      const { insights } = await googleAdsAPI.getAIInsights(selectedCustomer.id);
      setAIInsights(insights);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    }
  };

  const loadPerformanceSummary = async () => {
    if (!selectedCustomer) return;
    
    try {
      const summary = await googleAdsAPI.getPerformanceSummary(selectedCustomer.id);
      setPerformanceSummary(summary);
    } catch (err) {
      console.error('Failed to load performance summary:', err);
    }
  };

  const generateAIInsights = async () => {
    if (!selectedCustomer) return;
    
    setIsGeneratingInsights(true);
    try {
      // Trigger optimization analysis
      await googleAdsAPI.optimizeCampaigns(selectedCustomer.id, {
        optimization_type: 'performance_analysis',
        auto_apply: false
      });
      
      // Reload insights
      await loadAIInsights();
    } catch (err) {
      setError('Failed to generate AI insights');
      console.error(err);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const dismissInsight = (insightId: string) => {
    setAIInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const handleSaveConfig = () => {
    // This would save the configuration to backend
    alert('Configuration saved! (This would integrate with backend API)');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'keyword':
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
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-blue-600">Loading...</span>
            </div>
          </div>
        )}
        
        {isConnected && customers.length > 0 && !selectedCustomer && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Select Google Ads Account
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Choose which Google Ads account you want to manage:</p>
                </div>
                <div className="mt-4">
                  <select
                    value={selectedCustomer ? selectedCustomer.id : ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const customer = customers.find(c => c.id === e.target.value);
                      setSelectedCustomer(customer || null);
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-blue-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an account...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.id}) - {customer.currency} - {customer.timezone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected && customers.length === 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  No Google Ads Accounts Found
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>Your Google account is authenticated, but no Google Ads accounts were found. This might be because:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>You don't have any Google Ads accounts set up</li>
                    <li>The accounts aren't linked to your Google login</li>
                    <li>Account permissions need to be configured</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <a
                    href="https://ads.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Create Google Ads Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Authentication Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Connect your Google Ads account to access real campaign data and manage your advertisements.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="bg-yellow-50 px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 border border-yellow-300"
                  >
                    <i className="fas fa-plug mr-2"></i>
                    Connect Google Ads
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isConnected && selectedCustomer && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Connected to Google Ads
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Managing account: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.id})</p>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
            <SparklesIcon className="h-4 w-4 mr-2 inline" />
            AI Assistant
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
                              {campaign.start_date} {campaign.end_date && `- ${campaign.end_date}`}
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
                            <div className="text-sm text-gray-900">{formatCurrency(campaign.budget_amount, campaign.currency)}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(campaign.metrics.cost, campaign.currency)}</div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-red-600 h-1.5 rounded-full"
                                style={{ width: `${(campaign.metrics.cost / campaign.budget_amount) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.metrics.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.metrics.clicks.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              {(campaign.metrics.ctr * 100).toFixed(1)}%
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(campaign.metrics.cpc, campaign.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.metrics.conversions}
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
            {isConnected && selectedCustomer ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
                    <p className="text-gray-600 mt-1">
                      {performanceSummary?.summary?.period || 'Last 30 days'} - {selectedCustomer.name}
                    </p>
                  </div>
                  <button
                    onClick={loadPerformanceSummary}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        performanceSummary?.summary?.total_cost || 0,
                        performanceSummary?.summary?.currency || 'USD'
                      )}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="text-xs text-gray-500">
                        {performanceSummary?.summary?.active_campaigns || 0} active campaigns
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Avg. CTR</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceSummary?.summary?.avg_ctr?.toFixed(2) || '0.00'}%
                    </p>
                    <div className="flex items-center mt-2">
                      {(performanceSummary?.summary?.avg_ctr || 0) > 2 ? (
                        <>
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Good performance</span>
                        </>
                      ) : (
                        <>
                          <ArrowTrendingDownIcon className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-sm text-orange-600">Needs optimization</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Avg. CPC</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        performanceSummary?.summary?.avg_cpc || 0,
                        performanceSummary?.summary?.currency || 'USD'
                      )}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="text-xs text-gray-500">
                        {performanceSummary?.summary?.total_clicks?.toLocaleString() || 0} total clicks
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {performanceSummary?.summary?.total_conversions?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="text-xs text-gray-500">
                        {performanceSummary?.summary?.conversion_rate?.toFixed(2) || '0.00'}% conversion rate
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {performanceSummary?.summary?.total_impressions?.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Conversion Value</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(
                        performanceSummary?.summary?.conversion_value || 0,
                        performanceSummary?.summary?.currency || 'USD'
                      )}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {performanceSummary?.summary?.total_campaigns || 0}
                    </p>
                  </div>
                </div>

                {/* Insights */}
                {performanceSummary?.top_insights?.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {performanceSummary.top_insights.map((insight: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-600' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {insight.impact === 'high' ? '!' : insight.impact === 'medium' ? '⚠' : 'ℹ'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Unavailable</h3>
                <p className="text-gray-600">
                  {!isConnected ? 'Connect your Google Ads account to view analytics' : 'Select a Google Ads account to view performance data'}
                </p>
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
                    <p className="text-gray-600 mt-1">Get AI-powered insights, recommendations, and alerts for your Google Ads campaigns</p>
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
                                {insight.campaign_id && (
                                  <span className="text-xs">
                                    Campaign: {campaigns.find(c => c.id === insight.campaign_id)?.name}
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

                {/* AI Features Overview */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <BoltIcon className="h-6 w-6 text-red-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Campaign Optimization</h4>
                      <p className="text-sm text-gray-600 mt-1">AI analyzes performance and suggests improvements</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Budget Alerts</h4>
                      <p className="text-sm text-gray-600 mt-1">Get notified before budget limits are reached</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <LightBulbIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Keyword Insights</h4>
                      <p className="text-sm text-gray-600 mt-1">Discover high-performing keywords and negative keywords</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900">Smart Recommendations</h4>
                      <p className="text-sm text-gray-600 mt-1">AI-powered suggestions for better campaign performance</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick AI Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <BoltIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Optimize All Campaigns</span>
                      </div>
                      <p className="text-sm text-gray-600">Run AI optimization across all active campaigns</p>
                    </button>
                    
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <LightBulbIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Keyword Research</span>
                      </div>
                      <p className="text-sm text-gray-600">Discover new high-potential keywords</p>
                    </button>
                    
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                      <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Budget Health Check</span>
                      </div>
                      <p className="text-sm text-gray-600">Review budget allocation and spending patterns</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant Unavailable</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Connect your Google Ads account to access AI-powered campaign optimization, budget alerts, and keyword recommendations.
                </p>
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <i className="fas fa-plug mr-2"></i>
                  Connect Google Ads Account
                </button>
              </div>
            )}
          </Tab.Panel>


        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 