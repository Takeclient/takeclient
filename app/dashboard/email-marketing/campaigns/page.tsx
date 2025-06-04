'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

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
  createdAt: string;
  provider: {
    name: string;
    type: string;
  };
}

const STATUS_COLORS: { [key: string]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  SENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: { [key: string]: any } = {
  DRAFT: DocumentDuplicateIcon,
  SCHEDULED: ClockIcon,
  SENDING: RocketLaunchIcon,
  SENT: CheckCircleIcon,
  PAUSED: PauseIcon,
  FAILED: XCircleIcon,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email-marketing/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Campaign deleted successfully');
        await fetchCampaigns();
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCampaigns.length} campaigns?`)) {
      return;
    }

    try {
      const response = await fetch('/api/email-marketing/campaigns/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCampaigns }),
      });

      if (response.ok) {
        toast.success('Campaigns deleted successfully');
        setSelectedCampaigns([]);
        await fetchCampaigns();
      } else {
        toast.error('Failed to delete campaigns');
      }
    } catch (error) {
      console.error('Error deleting campaigns:', error);
      toast.error('Failed to delete campaigns');
    }
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status] || DocumentDuplicateIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchTerm === '' || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <RocketLaunchIcon className="h-7 w-7 text-blue-600 mr-3" />
            Email Campaigns
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your email marketing campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/email-marketing/campaigns/new">
            <Button>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Sent</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Avg Open Rate</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {campaigns.length > 0 
              ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.openCount / (c.sentCount || 1)), 0) / campaigns.length * 100)}%`
              : '0%'
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Avg Click Rate</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {campaigns.length > 0 
              ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.clickCount / (c.sentCount || 1)), 0) / campaigns.length * 100)}%`
              : '0%'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-56">
            <label htmlFor="status-filter" className="sr-only">
              Status
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="status-filter"
                name="status-filter"
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="SENDING">Sending</option>
                <option value="SENT">Sent</option>
                <option value="PAUSED">Paused</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {selectedCampaigns.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedCampaigns.length} selected
              </span>
              <Button
                type="button"
                variant="danger"
                onClick={handleBulkDelete}
              >
                <TrashIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center">
            <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first email campaign.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/email-marketing/campaigns/new">
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                        } else {
                          setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                        }
                      }}
                    />
                    
                    <div className="flex-1 flex items-center justify-between">
                      <Link 
                        href={`/dashboard/email-marketing/campaigns/${campaign.id}`}
                        className="flex-1"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                            <RocketLaunchIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-blue-600">
                                {campaign.name}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>
                                {getStatusIcon(campaign.status)}
                                <span className="ml-1">{campaign.status}</span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{campaign.subject}</span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <span className="mr-1">{getProviderIcon(campaign.provider.type)}</span>
                                {campaign.provider.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="ml-4 flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {campaign.recipientCount.toLocaleString()} recipients
                          </p>
                          <p className="text-xs text-gray-500">
                            {campaign.sentCount > 0 
                              ? `${Math.round(campaign.openCount / campaign.sentCount * 100)}% open rate`
                              : formatDate(campaign.createdAt)
                            }
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/email-marketing/campaigns/${campaign.id}`}>
                            <button
                              type="button"
                              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </Link>
                          
                          {campaign.status === 'DRAFT' && (
                            <Link href={`/dashboard/email-marketing/campaigns/${campaign.id}/edit`}>
                              <button
                                type="button"
                                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                            </Link>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleDelete(campaign.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 