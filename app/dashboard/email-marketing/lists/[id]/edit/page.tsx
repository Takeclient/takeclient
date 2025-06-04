'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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

export default function EditEmailListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  
  const [list, setList] = useState<EmailList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    doubleOptIn: false,
  });

  useEffect(() => {
    if (listId) {
      fetchListData();
    }
  }, [listId]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email-marketing/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setList(data.list);
        setFormData({
          name: data.list.name,
          description: data.list.description || '',
          doubleOptIn: data.list.doubleOptIn,
        });
      } else if (response.status === 404) {
        toast.error('Email list not found');
        router.push('/dashboard/email-marketing/lists');
      } else {
        toast.error('Failed to load email list');
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Failed to load email list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('List name is required');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/email-marketing/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Email list updated successfully');
        router.push(`/dashboard/email-marketing/lists/${listId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update list');
      }
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${list?.name}"? This will permanently remove the list and all its subscribers. This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/lists/${listId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Email list deleted successfully');
        router.push('/dashboard/email-marketing/lists');
      } else {
        toast.error('Failed to delete email list');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete email list');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Email list not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The email list you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/email-marketing/lists">
            <Button>
              Back to Email Lists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/email-marketing/lists/${listId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to {list.name}
        </Link>
        
        <div className="flex items-center">
          <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Email List</h1>
            <p className="text-sm text-gray-500">Update your email list settings</p>
          </div>
        </div>
      </div>

      {/* List Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Current List Statistics</p>
            <div className="mt-1 text-blue-700">
              <span className="font-semibold">{list._count.subscribers}</span> total subscribers
              <span className="mx-2">•</span>
              Created {formatDate(list.createdAt)}
              <span className="mx-2">•</span>
              Last updated {formatDate(list.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">List Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Newsletter Subscribers"
              />
              <p className="mt-1 text-xs text-gray-500">
                This name will be used to identify your list in campaigns and reports.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of this email list"
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide additional context about this list's purpose or target audience.
              </p>
            </div>
            
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={formData.doubleOptIn}
                    onChange={(e) => setFormData({ ...formData, doubleOptIn: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-medium text-gray-700">
                    Enable double opt-in
                  </label>
                  <p className="text-gray-500">
                    Subscribers must confirm their email address before being added to the list. 
                    This improves deliverability and ensures compliance with email regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning about double opt-in changes */}
        {list.doubleOptIn !== formData.doubleOptIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Double Opt-in Setting Change</p>
                <p className="mt-1 text-yellow-700">
                  {formData.doubleOptIn 
                    ? "Enabling double opt-in will require new subscribers to confirm their email address. Existing subscribers will remain active."
                    : "Disabling double opt-in will allow new subscribers to be added immediately without email confirmation. This may affect deliverability."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete List
          </Button>
          
          <div className="flex space-x-4">
            <Link href={`/dashboard/email-marketing/lists/${listId}`}>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 