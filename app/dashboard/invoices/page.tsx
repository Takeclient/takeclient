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
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
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
  quotation?: {
    id: string;
    quotationNumber: string;
  };
  proforma?: {
    id: string;
    invoiceNumber: string;
  };
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
}

interface ProformaInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate?: string;
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
  quotation?: {
    id: string;
    quotationNumber: string;
  };
  sentAt?: string;
  convertedAt?: string;
}

const INVOICE_STATUS_COLORS: { [key: string]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-purple-100 text-purple-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
};

const PROFORMA_STATUS_COLORS: { [key: string]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONVERTED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const INVOICE_STATUS_ICONS: { [key: string]: any } = {
  DRAFT: ClockIcon,
  SENT: EnvelopeIcon,
  VIEWED: EyeIcon,
  PARTIALLY_PAID: CurrencyDollarIcon,
  PAID: CheckCircleIcon,
  OVERDUE: ExclamationTriangleIcon,
  CANCELLED: XCircleIcon,
  REFUNDED: ArrowDownTrayIcon,
};

const PROFORMA_STATUS_ICONS: { [key: string]: any } = {
  DRAFT: ClockIcon,
  SENT: EnvelopeIcon,
  CONVERTED: CheckCircleIcon,
  CANCELLED: XCircleIcon,
};

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'proforma'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch invoices
      const invoicesResponse = await fetch('/api/invoices');
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices);
      }

      // Fetch proforma invoices
      const proformaResponse = await fetch('/api/proforma-invoices');
      if (proformaResponse.ok) {
        const proformaData = await proformaResponse.json();
        setProformaInvoices(proformaData.proformaInvoices);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'invoice' | 'proforma') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      const endpoint = type === 'invoice' ? `/api/invoices/${id}` : `/api/proforma-invoices/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${type === 'invoice' ? 'Invoice' : 'Proforma invoice'} deleted successfully`);
        await fetchData();
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    try {
      const endpoint = activeTab === 'invoices' ? '/api/invoices/bulk' : '/api/proforma-invoices/bulk';
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems }),
      });

      if (response.ok) {
        toast.success('Items deleted successfully');
        setSelectedItems([]);
        await fetchData();
      } else {
        toast.error('Failed to delete items');
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
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

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'PAID' && status !== 'CANCELLED' && new Date(dueDate) < new Date();
  };

  // Filter data based on active tab
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.deal?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredProformaInvoices = proformaInvoices.filter(proforma => {
    const matchesSearch = searchTerm === '' || 
      proforma.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.billingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proforma.deal?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || proforma.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const currentData = activeTab === 'invoices' ? filteredInvoices : filteredProformaInvoices;
  const statusColors = activeTab === 'invoices' ? INVOICE_STATUS_COLORS : PROFORMA_STATUS_COLORS;
  const statusIcons = activeTab === 'invoices' ? INVOICE_STATUS_ICONS : PROFORMA_STATUS_ICONS;

  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your invoices and proforma invoices
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Link href="/dashboard/invoices/proforma/new">
            <Button variant="outline">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Proforma
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button>
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('invoices');
                setSelectedItems([]);
                setStatusFilter('ALL');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('proforma');
                setSelectedItems([]);
                setStatusFilter('ALL');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'proforma'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Proforma Invoices ({proformaInvoices.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {activeTab === 'invoices' ? (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Invoices</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{invoices.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(invoices.reduce((sum, i) => sum + i.totalAmount, 0))}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {formatCurrency(invoices.reduce((sum, i) => sum + i.paidAmount, 0))}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {formatCurrency(invoices.reduce((sum, i) => sum + i.dueAmount, 0))}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Proformas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{proformaInvoices.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatCurrency(proformaInvoices.reduce((sum, p) => sum + p.totalAmount, 0))}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Converted</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {proformaInvoices.filter(p => p.status === 'CONVERTED').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                {proformaInvoices.filter(p => ['DRAFT', 'SENT'].includes(p.status)).length}
              </p>
            </div>
          </>
        )}
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
                placeholder={`Search ${activeTab}...`}
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
                {activeTab === 'invoices' ? (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="VIEWED">Viewed</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </>
                ) : (
                  <>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedItems.length} selected
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

      {/* Items List */}
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
        ) : currentData.length === 0 ? (
          <div className="py-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === 'invoices' ? 'invoices' : 'proforma invoices'} found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new {activeTab === 'invoices' ? 'invoice' : 'proforma invoice'}.
            </p>
            <div className="mt-6">
              <Link href={activeTab === 'invoices' ? '/dashboard/invoices/new' : '/dashboard/invoices/proforma/new'}>
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New {activeTab === 'invoices' ? 'Invoice' : 'Proforma'}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {currentData.map((item) => {
              const StatusIcon = statusIcons[item.status] || DocumentTextIcon;
              const isItemOverdue = activeTab === 'invoices' && 'dueDate' in item && item.dueDate && isOverdue(item.dueDate, item.status);
              
              return (
                <li key={item.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                      />
                      
                      <div className="flex-1 flex items-center justify-between">
                        <Link 
                          href={`/dashboard/invoices/${activeTab === 'invoices' ? '' : 'proforma/'}${item.id}`}
                          className="flex-1"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                              <DocumentTextIcon className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-blue-600">
                                  {item.invoiceNumber}
                                </p>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isItemOverdue ? 'bg-red-100 text-red-800' : statusColors[item.status]
                                }`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {isItemOverdue ? 'OVERDUE' : item.status}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>{item.billingName}</span>
                                {item.company && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{item.company.name}</span>
                                  </>
                                )}
                                {item.deal && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span>{item.deal.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                        
                        <div className="ml-4 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activeTab === 'invoices' && 'dueDate' in item && item.dueDate
                                ? `Due ${formatDate(item.dueDate)}`
                                : `Issued ${formatDate(item.issueDate)}`
                              }
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/invoices/${activeTab === 'invoices' ? '' : 'proforma/'}${item.id}`}>
                              <button
                                type="button"
                                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                title="View"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                            </Link>
                            
                            {item.status === 'DRAFT' && (
                              <Link href={`/dashboard/invoices/${activeTab === 'invoices' ? '' : 'proforma/'}${item.id}/edit`}>
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
                              onClick={() => handleDelete(item.id, activeTab === 'invoices' ? 'invoice' : 'proforma')}
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