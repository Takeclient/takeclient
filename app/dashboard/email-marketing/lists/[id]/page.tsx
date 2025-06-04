'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface EmailList {
  id: string;
  name: string;
  description?: string;
  doubleOptIn: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    subscribers: number;
  };
}

interface Subscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  source: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  ACTIVE: 'bg-green-100 text-green-800',
  UNSUBSCRIBED: 'bg-red-100 text-red-800',
  BOUNCED: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-blue-100 text-blue-800',
};

const STATUS_ICONS: { [key: string]: any } = {
  ACTIVE: CheckCircleIcon,
  UNSUBSCRIBED: XCircleIcon,
  BOUNCED: XCircleIcon,
  PENDING: CheckCircleIcon,
};

export default function EmailListDetailPage() {
  const params = useParams();
  const listId = params.id as string;
  
  const [list, setList] = useState<EmailList | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);

  useEffect(() => {
    if (listId) {
      fetchListData();
      fetchSubscribers();
    }
  }, [listId]);

  const fetchListData = async () => {
    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setList(data.list);
      } else if (response.status === 404) {
        toast.error('Email list not found');
      } else {
        toast.error('Failed to load email list');
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Failed to load email list');
    }
  };

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email-marketing/lists/${listId}/subscribers`);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } else {
        toast.error('Failed to load subscribers');
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}/subscribers/${subscriberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Subscriber removed successfully');
        await fetchSubscribers();
        await fetchListData(); // Refresh counts
      } else {
        toast.error('Failed to remove subscriber');
      }
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast.error('Failed to remove subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${selectedSubscribers.length} subscribers?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}/subscribers/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberIds: selectedSubscribers }),
      });

      if (response.ok) {
        toast.success('Subscribers removed successfully');
        setSelectedSubscribers([]);
        await fetchSubscribers();
        await fetchListData();
      } else {
        toast.error('Failed to remove subscribers');
      }
    } catch (error) {
      console.error('Error removing subscribers:', error);
      toast.error('Failed to remove subscribers');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list?.name || 'email-list'}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Email list exported successfully');
      } else {
        toast.error('Failed to export email list');
      }
    } catch (error) {
      console.error('Error exporting list:', error);
      toast.error('Failed to export email list');
    }
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

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status] || CheckCircleIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = searchTerm === '' || 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.firstName && subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subscriber.lastName && subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'ALL' || subscriber.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeCount = subscribers.filter(s => s.status === 'ACTIVE').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'UNSUBSCRIBED').length;
  const bouncedCount = subscribers.filter(s => s.status === 'BOUNCED').length;
  const pendingCount = subscribers.filter(s => s.status === 'PENDING').length;

  if (!list) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/email-marketing/lists"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Email Lists
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
              {list.description && (
                <p className="text-sm text-gray-500">{list.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/email-marketing/lists/${listId}/import`}>
              <Button variant="secondary">
                <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                Import
              </Button>
            </Link>
            
            <Button variant="secondary" onClick={handleExport}>
              <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
              Export
            </Button>
            
            <Link href={`/dashboard/email-marketing/lists/${listId}/edit`}>
              <Button variant="secondary">
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* List Info */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Subscribers</h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{list._count.subscribers}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="mt-1 text-2xl font-semibold text-green-600">{activeCount}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Unsubscribed</h3>
            <p className="mt-1 text-2xl font-semibold text-red-600">{unsubscribedCount}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bounced</h3>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">{bouncedCount}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <span>Created {formatDate(list.createdAt)}</span>
          <span>•</span>
          <span>Updated {formatDate(list.updatedAt)}</span>
          {list.doubleOptIn && (
            <>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Double Opt-in Enabled
              </span>
            </>
          )}
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
                placeholder="Search subscribers..."
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
                <option value="ACTIVE">Active</option>
                <option value="UNSUBSCRIBED">Unsubscribed</option>
                <option value="BOUNCED">Bounced</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {selectedSubscribers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedSubscribers.length} selected
              </span>
              <Button
                type="button"
                variant="danger"
                onClick={handleBulkDelete}
              >
                <TrashIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscribers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start building your list by importing subscribers.
            </p>
            <div className="mt-6">
              <Link href={`/dashboard/email-marketing/lists/${listId}/import`}>
                <Button>
                  <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Import Subscribers
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredSubscribers.map((subscriber) => {
              const StatusIcon = STATUS_ICONS[subscriber.status] || CheckCircleIcon;
              
              return (
                <li key={subscriber.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubscribers([...selectedSubscribers, subscriber.id]);
                          } else {
                            setSelectedSubscribers(selectedSubscribers.filter(id => id !== subscriber.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">
                                {subscriber.firstName || subscriber.lastName 
                                  ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                                  : subscriber.email
                                }
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[subscriber.status]}`}>
                                {getStatusIcon(subscriber.status)}
                                <span className="ml-1">{subscriber.status}</span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{subscriber.email}</span>
                              <span className="mx-2">•</span>
                              <span>Source: {subscriber.source}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              Subscribed {formatDate(subscriber.subscribedAt)}
                            </p>
                            {subscriber.unsubscribedAt && (
                              <p className="text-xs text-red-500">
                                Unsubscribed {formatDate(subscriber.unsubscribedAt)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                              title="Remove Subscriber"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 