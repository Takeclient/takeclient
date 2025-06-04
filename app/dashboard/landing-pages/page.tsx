'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import CreatePageModal from './components/CreatePageModal';

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  customDomain?: string;
  views: number;
  uniqueVisitors: number;
  conversionRate: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  template?: {
    name: string;
  };
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

export default function LandingPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/landing-pages');
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      } else {
        toast.error('Failed to load landing pages');
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load landing pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Landing page deleted successfully');
        await fetchPages();
      } else {
        toast.error('Failed to delete landing page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete landing page');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/landing-pages/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Landing page duplicated successfully');
        await fetchPages();
      } else {
        toast.error('Failed to duplicate landing page');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate landing page');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = searchTerm === '' || 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (page.description && page.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'ALL' || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePage = async (data: { name: string; slug: string; domain?: string; templateId?: string }) => {
    try {
      setIsCreating(true);
      
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          customDomain: data.domain,
          templateId: data.templateId,
          content: [],
          status: 'DRAFT',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Landing page created successfully');
        setShowCreateModal(false);
        router.push(`/dashboard/landing-pages/${result.page.id}/edit`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create landing page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create landing page');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentDuplicateIcon className="h-7 w-7 text-blue-600 mr-3" />
            Landing Pages
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage beautiful landing pages for your campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/dashboard/landing-pages/templates">
            <Button variant="secondary">
              <SparklesIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Browse Templates
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create Page
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Pages</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{pages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Published</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {pages.filter(p => p.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Views</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {pages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Avg. Conversion</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            {pages.length > 0 
              ? (pages.reduce((sum, p) => sum + p.conversionRate, 0) / pages.length).toFixed(1)
              : 0
            }%
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
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="py-12 text-center">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No landing pages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first landing page.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/landing-pages/new">
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Create Page
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map((page) => (
                <div key={page.id} className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  {/* Preview Thumbnail */}
                  <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <DocumentTextIcon className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[page.status as keyof typeof STATUS_COLORS]}`}>
                        {page.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {page.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">/{page.slug}</p>
                    
                    {page.customDomain && (
                      <p className="text-sm text-blue-600 mb-2 flex items-center">
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        {page.customDomain}
                      </p>
                    )}
                    
                    {page.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {page.description}
                      </p>
                    )}
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Views</p>
                        <p className="text-sm font-semibold">{page.views.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Visitors</p>
                        <p className="text-sm font-semibold">{page.uniqueVisitors.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-500">Conv.</p>
                        <p className="text-sm font-semibold">{page.conversionRate}%</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      {page.template ? (
                        <span>Template: {page.template.name}</span>
                      ) : (
                        <span>Created from scratch</span>
                      )}
                      <span className="mx-2">•</span>
                      <span>Updated {formatDate(page.updatedAt)}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {page.status === 'PUBLISHED' && (
                          <a
                            href={page.customDomain ? `https://${page.customDomain}` : `/p/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            title="View Live"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </a>
                        )}
                        
                        <Link href={`/dashboard/landing-pages/${page.id}/edit`}>
                          <button
                            type="button"
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </Link>
                        
                        <Link href={`/dashboard/landing-pages/${page.id}/analytics`}>
                          <button
                            type="button"
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            title="Analytics"
                          >
                            <ChartBarIcon className="h-5 w-5" />
                          </button>
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(page.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                          title="Duplicate"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleDelete(page.id)}
                          className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreatePage}
      />
    </div>
  );
} 