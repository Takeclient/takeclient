'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  status: string;
  issueDate: string;
  validUntil: string;
  billingName: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
  billingCountry?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  discountType: string;
  discountValue: number;
  terms?: string;
  notes?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  convertedAt?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  company?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  deal?: {
    id: string;
    name: string;
    value: number;
  };
  items: QuotationItem[];
  createdBy: {
    id: string;
    name?: string;
    email: string;
  };
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

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuotation();
    }
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/quotations/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setQuotation(data);
      } else if (response.status === 404) {
        toast.error('Quotation not found');
        router.push('/dashboard/quotations');
      } else {
        toast.error('Failed to load quotation');
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to load quotation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Quotation deleted successfully');
        router.push('/dashboard/quotations');
      } else {
        toast.error('Failed to delete quotation');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Quotation duplicated successfully');
        router.push(`/dashboard/quotations/${data.id}`);
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
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
            <p className="mt-2 text-gray-600">The quotation you're looking for doesn't exist.</p>
            <Link href="/dashboard/quotations">
              <Button className="mt-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Quotations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[quotation.status] || ClockIcon;
  const expired = quotation.status === 'DRAFT' && isExpired(quotation.validUntil);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/quotations">
                <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {quotation.quotationNumber}
                </h1>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    expired ? 'bg-orange-100 text-orange-800' : STATUS_COLORS[quotation.status]
                  }`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {expired ? 'EXPIRED' : quotation.status}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Created {formatDate(quotation.issueDate)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {quotation.status === 'DRAFT' && (
                <>
                  <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
                    <Button variant="outline">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={handleDuplicate}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.print()}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Quotation Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quotation Number</dt>
                    <dd className="text-sm text-gray-900">{quotation.quotationNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                    <dd className="text-sm text-gray-900">{formatDate(quotation.issueDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
                    <dd className={`text-sm ${isExpired(quotation.validUntil) ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(quotation.validUntil)}
                      {isExpired(quotation.validUntil) && ' (Expired)'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                    <dd className="text-sm text-gray-900">{quotation.createdBy.name || quotation.createdBy.email}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bill To</h3>
                <div className="text-sm text-gray-900">
                  <p className="font-medium">{quotation.billingName}</p>
                  {quotation.billingEmail && <p>{quotation.billingEmail}</p>}
                  {quotation.billingPhone && <p>{quotation.billingPhone}</p>}
                  {quotation.billingAddress && (
                    <div className="mt-2">
                      <p>{quotation.billingAddress}</p>
                      <p>
                        {[quotation.billingCity, quotation.billingState, quotation.billingZipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {quotation.billingCountry && <p>{quotation.billingCountry}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Records */}
            {(quotation.contact || quotation.company || quotation.deal) && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quotation.contact && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Contact</h4>
                      <p className="text-sm text-gray-600">
                        {quotation.contact.firstName} {quotation.contact.lastName}
                      </p>
                      {quotation.contact.email && (
                        <p className="text-sm text-gray-600">{quotation.contact.email}</p>
                      )}
                    </div>
                  )}
                  
                  {quotation.company && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Company</h4>
                      <p className="text-sm text-gray-600">{quotation.company.name}</p>
                      {quotation.company.email && (
                        <p className="text-sm text-gray-600">{quotation.company.email}</p>
                      )}
                    </div>
                  )}
                  
                  {quotation.deal && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">Deal</h4>
                      <p className="text-sm text-gray-600">{quotation.deal.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(quotation.deal.value * 100)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotation.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {item.taxRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(quotation.subtotal)}</dd>
                  </div>
                  
                  {quotation.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">
                        Discount ({quotation.discountType === 'PERCENTAGE' ? `${quotation.discountValue}%` : 'Fixed'})
                      </dt>
                      <dd className="text-sm text-gray-900">-{formatCurrency(quotation.discountAmount)}</dd>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Tax</dt>
                    <dd className="text-sm text-gray-900">{formatCurrency(quotation.taxAmount)}</dd>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">{formatCurrency(quotation.totalAmount)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Terms and Notes */}
            {(quotation.terms || quotation.notes) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {quotation.terms && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.terms}</p>
                  </div>
                )}
                
                {quotation.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 