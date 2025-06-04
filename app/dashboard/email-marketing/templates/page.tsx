'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_CATEGORIES = [
  'NEWSLETTER',
  'PROMOTIONAL',
  'TRANSACTIONAL',
  'WELCOME',
  'FOLLOW_UP',
  'ANNOUNCEMENT',
  'SURVEY',
  'OTHER',
];

const CATEGORY_COLORS: { [key: string]: string } = {
  NEWSLETTER: 'bg-blue-100 text-blue-800',
  PROMOTIONAL: 'bg-green-100 text-green-800',
  TRANSACTIONAL: 'bg-purple-100 text-purple-800',
  WELCOME: 'bg-yellow-100 text-yellow-800',
  FOLLOW_UP: 'bg-orange-100 text-orange-800',
  ANNOUNCEMENT: 'bg-red-100 text-red-800',
  SURVEY: 'bg-indigo-100 text-indigo-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email-marketing/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/email-marketing/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        await fetchTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedTemplates.length} templates?`)) {
      return;
    }

    try {
      const response = await fetch('/api/email-marketing/templates/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTemplates }),
      });

      if (response.ok) {
        toast.success('Templates deleted successfully');
        setSelectedTemplates([]);
        await fetchTemplates();
      } else {
        toast.error('Failed to delete templates');
      }
    } catch (error) {
      console.error('Error deleting templates:', error);
      toast.error('Failed to delete templates');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/email-marketing/templates/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Template duplicated successfully');
        await fetchTemplates();
      } else {
        toast.error('Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'ALL' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DocumentDuplicateIcon className="h-7 w-7 text-blue-600 mr-3" />
            Email Templates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage reusable email templates for your campaigns
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/email-marketing/templates/new">
            <Button>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Templates</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{templates.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Templates</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {templates.filter(t => t.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Most Used</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {templates.length > 0 ? Math.max(...templates.map(t => t.usageCount)) : 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Categories</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            {new Set(templates.map(t => t.category)).size}
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
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-56">
            <label htmlFor="category-filter" className="sr-only">
              Category
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="category-filter"
                name="category-filter"
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {TEMPLATE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTemplates.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedTemplates.length} selected
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <TrashIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first email template.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/email-marketing/templates/new">
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Template
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTemplates([...selectedTemplates, template.id]);
                        } else {
                          setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                        }
                      }}
                    />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[template.category]}`}>
                      {template.category.charAt(0) + template.category.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  
                  <Link href={`/dashboard/email-marketing/templates/${template.id}`}>
                    <div className="cursor-pointer">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-blue-600">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {truncateContent(template.content)}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Used {template.usageCount} times</span>
                    <span>{formatDate(template.updatedAt)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/email-marketing/templates/${template.id}`}>
                        <button
                          type="button"
                          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      
                      <Link href={`/dashboard/email-marketing/templates/${template.id}/edit`}>
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
                        onClick={() => handleDuplicate(template.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        title="Duplicate"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDelete(template.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                      <span className="ml-1 text-xs text-gray-500">
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
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