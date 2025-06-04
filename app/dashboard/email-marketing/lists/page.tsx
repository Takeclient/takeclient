'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface EmailList {
  id: string;
  name: string;
  description?: string;
  subscriberCount: number;
  activeCount: number;
  unsubscribedCount: number;
  doubleOptIn: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    subscribers: number;
  };
}

export default function EmailListsPage() {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email-marketing/lists');
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists || []);
      } else {
        toast.error('Failed to load email lists');
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to load email lists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email list? This will also remove all subscribers.')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/lists/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Email list deleted successfully');
        await fetchLists();
      } else {
        toast.error('Failed to delete email list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete email list');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedLists.length} email lists?`)) {
      return;
    }

    try {
      const response = await fetch('/api/email-marketing/lists/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedLists }),
      });

      if (response.ok) {
        toast.success('Email lists deleted successfully');
        setSelectedLists([]);
        await fetchLists();
      } else {
        toast.error('Failed to delete email lists');
      }
    } catch (error) {
      console.error('Error deleting lists:', error);
      toast.error('Failed to delete email lists');
    }
  };

  const handleExport = async (listId: string) => {
    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-list-${listId}.csv`;
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
    });
  };

  // Filter lists
  const filteredLists = lists.filter(list => {
    const matchesSearch = searchTerm === '' || 
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesSearch;
  });

  // Calculate totals
  const totalSubscribers = lists.reduce((sum, list) => sum + (list._count?.subscribers || 0), 0);
  const totalActive = lists.reduce((sum, list) => sum + (list.activeCount || 0), 0);
  const totalUnsubscribed = lists.reduce((sum, list) => sum + (list.unsubscribedCount || 0), 0);

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="h-7 w-7 text-blue-600 mr-3" />
            Email Lists
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your email subscriber lists and segments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/email-marketing/lists/new">
            <Button>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New List
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Lists</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{lists.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {totalSubscribers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Subscribers</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {totalActive.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Unsubscribed</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {totalUnsubscribed.toLocaleString()}
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
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {selectedLists.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedLists.length} selected
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

      {/* Lists Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="py-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No email lists found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first email list.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/email-marketing/lists/new">
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New List
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map((list) => (
                <div key={list.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedLists.includes(list.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLists([...selectedLists, list.id]);
                        } else {
                          setSelectedLists(selectedLists.filter(id => id !== list.id));
                        }
                      }}
                    />
                    <div className="flex items-center space-x-1">
                      {list.doubleOptIn && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Double Opt-in
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link href={`/dashboard/email-marketing/lists/${list.id}`}>
                    <div className="cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <UserGroupIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-blue-600">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-sm text-gray-600 mb-4">{list.description}</p>
                      )}
                    </div>
                  </Link>
                  
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{list._count?.subscribers || 0}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{list.activeCount || 0}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{list.unsubscribedCount || 0}</p>
                      <p className="text-xs text-gray-500">Unsubscribed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created {formatDate(list.createdAt)}</span>
                    <span>Updated {formatDate(list.updatedAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/email-marketing/lists/${list.id}`}>
                        <button
                          type="button"
                          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      
                      <Link href={`/dashboard/email-marketing/lists/${list.id}/edit`}>
                        <button
                          type="button"
                          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      
                      <button
                        type="button"
                        onClick={() => handleExport(list.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        title="Export"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDelete(list.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <Link href={`/dashboard/email-marketing/lists/${list.id}/import`}>
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        title="Import Subscribers"
                      >
                        <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
                        Import
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 