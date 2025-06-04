'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import EmbedCodeModal from './components/EmbedCodeModal';
import toast, { Toaster } from 'react-hot-toast';

interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  embedCode: string | null;
  _count?: {
    submissions: number;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PlanUsage {
  planName: string;
  usage: {
    contacts: number;
    deals: number;
    companies: number;
    users: number;
  };
  limits: {
    contacts: { used: number; limit: number; percentage: number };
    deals: { used: number; limit: number; percentage: number };
    companies: { used: number; limit: number; percentage: number };
    users: { used: number; limit: number; percentage: number };
  };
  features: {
    contacts: number;
    deals: number;
    companies: number;
    users: number;
    storage: string;
    support: string;
    automations: number;
    integrations: number;
  };
}

export default function FormListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedFormForEmbed, setSelectedFormForEmbed] = useState<Form | null>(null);
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Load forms on component mount
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    loadForms();
    loadPlanUsage();
  }, [status, pagination.page, search]);

  // Function to load plan usage
  const loadPlanUsage = async () => {
    try {
      const response = await fetch('/api/plan/usage');
      if (response.ok) {
        const usage = await response.json();
        setPlanUsage(usage);
      }
    } catch (error) {
      console.error('Error loading plan usage:', error);
    }
  };

  // Function to load forms with search and pagination
  const loadForms = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const searchParams = new URLSearchParams();
      searchParams.append('page', pagination.page.toString());
      searchParams.append('limit', pagination.limit.toString());
      if (search) searchParams.append('search', search);
      
      const response = await fetch(`/api/forms?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load forms');
      }
      
      const data = await response.json();
      setForms(data.forms);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading forms:', error);
      setError(error.message || 'An error occurred while loading forms');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  // Handle form deletion
  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? All submissions will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms?id=${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      // Reload forms and usage
      loadForms();
      loadPlanUsage();
    } catch (error: any) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle embed code display
  const handleShowEmbedCode = (form: Form) => {
    setSelectedFormForEmbed(form);
    setShowEmbedModal(true);
  };

  const handleCloseEmbedModal = () => {
    setShowEmbedModal(false);
    setSelectedFormForEmbed(null);
  };

  // Handle quick copy
  const handleQuickCopy = (embedCode: string) => {
    if (!embedCode) {
      toast.error('No embed code available for this form');
      return;
    }

    try {
      let embedData;
      try {
        embedData = JSON.parse(embedCode);
        navigator.clipboard.writeText(embedData.options?.standard || embedCode);
      } catch {
        navigator.clipboard.writeText(embedCode);
      }
      toast.success('Embed code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy embed code');
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-amber-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Form Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage forms for lead generation</p>
        </div>
        <Link 
          href="/dashboard/form-builder/new"
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
(planUsage?.limits?.contacts?.percentage ?? 0) < 100
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (planUsage && (planUsage.limits?.contacts?.percentage ?? 0) >= 100) {
              e.preventDefault();
              toast.error('You have reached your contact limit. Upgrade your plan to create more forms.');
            }
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Form
        </Link>
      </div>

      {/* Plan Usage Card */}
      {planUsage && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Plan Usage - {planUsage.planName}
            </h3>
            <Link 
              href="/dashboard/billing"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage Plan
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contacts Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Contacts</span>
                <span className="text-sm text-gray-600">
                  {planUsage.limits.contacts.used} / {planUsage.limits.contacts.limit === -1 ? '∞' : planUsage.limits.contacts.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(planUsage.limits.contacts.percentage)}`}
                  style={{ width: `${Math.min(planUsage.limits.contacts.percentage, 100)}%` }}
                ></div>
              </div>
              {planUsage.limits.contacts.percentage >= 80 && (
                <div className="flex items-center text-amber-600 text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span>Running low on contact space</span>
                </div>
              )}
            </div>

            {/* Deals Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Deals</span>
                <span className="text-sm text-gray-600">
                  {planUsage.limits.deals.used} / {planUsage.limits.deals.limit === -1 ? '∞' : planUsage.limits.deals.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(planUsage.limits.deals.percentage)}`}
                  style={{ width: `${Math.min(planUsage.limits.deals.percentage, 100)}%` }}
                ></div>
              </div>
              {planUsage.limits.deals.percentage >= 80 && (
                <div className="flex items-center text-amber-600 text-sm">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span>Running low on deal space</span>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade prompt if needed */}
          {(planUsage.limits.contacts.percentage >= 80 || planUsage.limits.deals.percentage >= 80) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUpIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Consider upgrading your plan for more capacity
                  </span>
                </div>
                <Link 
                  href="/dashboard/billing"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Upgrade →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="text"
            placeholder="Search forms..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={search}
            onChange={handleSearchChange}
          />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Form list */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'No forms found matching your search.' : 'No forms created yet. Create your first form!'}
          </div>
        ) : (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{form.title}</div>
                          <div className="text-sm text-gray-500">{form.description || 'No description'}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {form._count?.submissions || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/dashboard/form-builder/edit/${form.id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Form"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleShowEmbedCode(form)} 
                          className="text-blue-600 hover:text-blue-900"
                          title="Get Embed Code"
                        >
                          <CodeBracketIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleQuickCopy(form.embedCode || '')} 
                          className="text-green-600 hover:text-green-900"
                          title="Quick Copy Embed Code"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>
                        <Link 
                          href={`/dashboard/form-builder/submissions/${form.id}`} 
                          className="text-orange-600 hover:text-orange-900"
                          title="View Submissions"
                        >
                          <ChartBarIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Form"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span> of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          const offset = Math.min(
                            Math.max(0, pagination.page - 3),
                            Math.max(0, pagination.totalPages - 5)
                          );
                          pageNum = i + 1 + offset;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embed Code Modal */}
      {showEmbedModal && selectedFormForEmbed && (
        <EmbedCodeModal
          isOpen={showEmbedModal}
          onClose={handleCloseEmbedModal}
          formTitle={selectedFormForEmbed.title}
          embedCode={selectedFormForEmbed.embedCode || ''}
        />
      )}
    </div>
  );
}