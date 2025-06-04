'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  EnvelopeIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  ServerIcon,
  RocketLaunchIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

type TabType = 'campaigns' | 'templates' | 'lists' | 'providers' | 'analytics';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  type: string;
  recipientCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt?: string;
  sentAt?: string;
  provider: {
    name: string;
    type: string;
  };
}

interface EmailList {
  id: string;
  name: string;
  description?: string;
  subscriberCount: number;
  activeCount: number;
  unsubscribedCount: number;
  createdAt: string;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  isDefault: boolean;
  defaultFromEmail?: string;
  createdAt: string;
}

export default function EmailMarketingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<EmailList[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'campaigns':
          await fetchCampaigns();
          break;
        case 'lists':
          await fetchLists();
          break;
        case 'providers':
          await fetchProviders();
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/email-marketing/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await fetch('/api/email-marketing/lists');
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/email-marketing/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const tabs = [
    {
      id: 'campaigns' as TabType,
      name: 'Campaigns',
      icon: RocketLaunchIcon,
      count: campaigns.length
    },
    {
      id: 'templates' as TabType,
      name: 'Templates',
      icon: DocumentDuplicateIcon,
      count: 0
    },
    {
      id: 'lists' as TabType,
      name: 'Lists',
      icon: UserGroupIcon,
      count: lists.length
    },
    {
      id: 'providers' as TabType,
      name: 'Providers',
      icon: ServerIcon,
      count: providers.length
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: ChartBarIcon,
      count: null
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'SCHEDULED':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'SENDING':
        return <RocketLaunchIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'DRAFT':
        return <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />;
      case 'PAUSED':
        return <PauseIcon className="h-5 w-5 text-orange-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'SENDGRID':
        return '📧';
      case 'MAILGUN':
        return '🔫';
      case 'AWS_SES':
        return '☁️';
      case 'INTERNAL_SMTP':
        return '🏠';
      default:
        return '📮';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <EnvelopeIcon className="h-7 w-7 text-blue-600 mr-3" />
              Email Marketing
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage email campaigns, templates, and subscriber lists
            </p>
          </div>
          
          {activeTab === 'campaigns' && (
            <Link
              href="/dashboard/email-marketing/campaigns/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Campaign
            </Link>
          )}
          
          {activeTab === 'templates' && (
            <Link
              href="/dashboard/email-marketing/templates/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Template
            </Link>
          )}
          
          {activeTab === 'lists' && (
            <Link
              href="/dashboard/email-marketing/lists/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New List
            </Link>
          )}
          
          {activeTab === 'providers' && (
            <Link
              href="/dashboard/email-marketing/providers/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Provider
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
              </p>
            </div>
            <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.openCount / (c.sentCount || 1)), 0) / campaigns.length * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            <EnvelopeIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length > 0 
                  ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.clickCount / (c.sentCount || 1)), 0) / campaigns.length * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {lists.reduce((sum, l) => sum + l.subscriberCount, 0).toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'campaigns' && (
              <div className="p-6">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/email-marketing/campaigns/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Campaign
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Campaign</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Recipients</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Opens</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Clicks</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Provider</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getStatusIcon(campaign.status)}
                                <span className="ml-2 text-sm text-gray-700">{campaign.status}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-sm text-gray-500">{campaign.subject}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{campaign.type}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{campaign.recipientCount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {campaign.sentCount > 0 
                                ? `${Math.round(campaign.openCount / campaign.sentCount * 100)}%`
                                : '-'
                              }
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {campaign.sentCount > 0 
                                ? `${Math.round(campaign.clickCount / campaign.sentCount * 100)}%`
                                : '-'
                              }
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">
                              <span className="flex items-center">
                                <span className="mr-1">{getProviderIcon(campaign.provider.type)}</span>
                                {campaign.provider.name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                href={`/dashboard/email-marketing/campaigns/${campaign.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Email Templates</h3>
                  <p className="mt-1 text-sm text-gray-500">Create reusable email templates for your campaigns.</p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/email-marketing/templates"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse Templates
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'lists' && (
              <div className="p-6">
                {lists.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No lists</h3>
                    <p className="mt-1 text-sm text-gray-500">Create your first subscriber list.</p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/email-marketing/lists/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New List
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map((list) => (
                      <Link
                        key={list.id}
                        href={`/dashboard/email-marketing/lists/${list.id}`}
                        className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                            {list.description && (
                              <p className="mt-1 text-sm text-gray-600">{list.description}</p>
                            )}
                          </div>
                          <UserGroupIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{list.subscriberCount}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{list.activeCount}</p>
                            <p className="text-xs text-gray-500">Active</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-600">{list.unsubscribedCount}</p>
                            <p className="text-xs text-gray-500">Unsubscribed</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'providers' && (
              <div className="p-6">
                {providers.length === 0 ? (
                  <div className="text-center py-12">
                    <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No providers configured</h3>
                    <p className="mt-1 text-sm text-gray-500">Add an email provider to start sending campaigns.</p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/email-marketing/providers/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Provider
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="p-6 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getProviderIcon(provider.type)}</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                              <p className="text-sm text-gray-600">{provider.type.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {provider.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Default
                              </span>
                            )}
                            {provider.isActive ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        {provider.defaultFromEmail && (
                          <p className="mt-3 text-sm text-gray-600">
                            From: {provider.defaultFromEmail}
                          </p>
                        )}
                        <div className="mt-4">
                          <Link
                            href={`/dashboard/email-marketing/providers/${provider.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Configure →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Email Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">Detailed analytics and insights coming soon.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 