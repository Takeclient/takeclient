'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface Quotation {
  id: string;
  quotationNumber: string;
  status: string;
  issueDate: string;
  validUntil: string;
  totalAmount: number;
  billingName: string;
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  company?: {
    id: string;
    name: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  convertedAt?: string;
}

const STATUS_COLORS: { [key: string]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
  CONVERTED: 'bg-indigo-100 text-indigo-800',
};

const STATUS_ICONS: { [key: string]: any } = {
  DRAFT: ClockIcon,
  SENT: EnvelopeIcon,
  VIEWED: EyeIcon,
  ACCEPTED: CheckCircleIcon,
  REJECTED: XCircleIcon,
  EXPIRED: ClockIcon,
  CONVERTED: DocumentDuplicateIcon,
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quotations');
      
      if (response.ok) {
        const data = await response.json();
        setQuotations(data.quotations);
      } else {
        toast.error('Failed to load quotations');
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Quotation deleted successfully');
        await fetchQuotations();
      } else {
        toast.error('Failed to delete quotation');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedQuotations.length} quotations?`)) {
      return;
    }

    try {
      const response = await fetch('/api/quotations/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedQuotations }),
      });

      if (response.ok) {
        toast.success('Quotations deleted successfully');
        setSelectedQuotations([]);
        await fetchQuotations();
      } else {
        toast.error('Failed to delete quotations');
      }
    } catch (error) {
      console.error('Error deleting quotations:', error);
      toast.error('Failed to delete quotations');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Quotation duplicated successfully');
        await fetchQuotations();
      } else {
        toast.error('Failed to duplicate quotation');
      }
    } catch (error) {
      console.error('Error duplicating quotation:', error);
      toast.error('Failed to duplicate quotation');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  // Filter quotations
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = searchTerm === '' || 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.billingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.deal?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage quotations for your deals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/quotations/new">
            <Button type="button">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Quotation
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Quotations</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{quotations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatCurrency(quotations.reduce((sum, q) => sum + q.totalAmount, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Accepted</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {quotations.filter(q => q.status === 'ACCEPTED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {quotations.filter(q => ['DRAFT', 'SENT', 'VIEWED'].includes(q.status)).length}
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
                placeholder="Search quotations..."
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
                <option value="SENT">Sent</option>
                <option value="VIEWED">Viewed</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>
          </div>

          {selectedQuotations.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedQuotations.length} selected
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

      {/* Quotations List */}
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
        ) : filteredQuotations.length === 0 ? (
          <div className="py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quotations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new quotation.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/quotations/new">
                <Button type="button">
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Quotation
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredQuotations.map((quotation) => {
              const StatusIcon = STATUS_ICONS[quotation.status] || DocumentTextIcon;
              const expired = quotation.status === 'DRAFT' && isExpired(quotation.validUntil);
              
              return (
                <li key={quotation.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                        checked={selectedQuotations.includes(quotation.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuotations([...selectedQuotations, quotation.id]);
                          } else {
                            setSelectedQuotations(selectedQuotations.filter(id => id !== quotation.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 flex items-center justify-between">
                        <Link 
                          href={`/dashboard/quotations/${quotation.id}`}
                          className="flex-1"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                              <DocumentTextIcon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-blue-600">
                                  {quotation.quotationNumber}
                                </p>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  expired ? 'bg-orange-100 text-orange-800' : STATUS_COLORS[quotation.status]
                                }`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {expired ? 'EXPIRED' : quotation.status}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>{quotation.billingName}</span>
                                {quotation.company && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{quotation.company.name}</span>
                                  </>
                                )}
                                {quotation.deal && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{quotation.deal.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                        
                        <div className="ml-4 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(quotation.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Valid until {formatDate(quotation.validUntil)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/quotations/${quotation.id}`}>
                              <button
                                type="button"
                                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                title="View"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                            </Link>
                            
                            {quotation.status === 'DRAFT' && (
                              <>
                                <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
                                  <button
                                    type="button"
                                    className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                    title="Edit"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </button>
                                </Link>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(quotation.id)}
                                  className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                  title="Duplicate"
                                >
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => handleDelete(quotation.id)}
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 