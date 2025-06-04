'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DealForm from '../../deal-form';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  description: string;
  source?: string;
  tags: string[];
  contactId: string | null;
  companyId: string | null;
}

export default function EditDealPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dealId = params.id as string;

  useEffect(() => {
    if (dealId) {
      loadDeal();
    }
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${dealId}`);
      
      if (response.ok) {
        const dealData = await response.json();
        // Convert value from cents to dollars for editing and ensure proper format
        setDeal({
          id: dealData.id,
          name: dealData.name,
          value: dealData.value / 100,
          stage: dealData.stage,
          probability: dealData.probability || 0,
          closeDate: dealData.closeDate || '',
          description: dealData.description || '',
          source: dealData.source || '',
          tags: dealData.tags || [],
          contactId: dealData.contactId || null,
          companyId: dealData.companyId || null,
        });
      } else if (response.status === 404) {
        toast.error('Deal not found');
        router.push('/dashboard/deals');
      } else {
        toast.error('Failed to load deal');
      }
    } catch (error) {
      console.error('Error loading deal:', error);
      toast.error('Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Deal not found</p>
        <Link
          href="/dashboard/deals"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/deals/${deal.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Deal
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
            <p className="text-gray-600 mt-1">Update deal information and details</p>
          </div>
        </div>
      </div>

      {/* Deal Form */}
      <DealForm initialData={deal} isEditing={true} />
    </div>
  );
} 