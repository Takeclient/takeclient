'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function WhatsAppBroadcastPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/whatsapp')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to WhatsApp
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">WhatsApp Broadcast</h1>
          <p className="mt-2 text-gray-600">
            Send bulk messages to multiple contacts at once
          </p>
          
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Coming Soon</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-2">
              <li>Create broadcast lists with unlimited contacts</li>
              <li>Send personalized messages using templates</li>
              <li>Schedule broadcasts for optimal delivery times</li>
              <li>Track delivery, read rates, and engagement</li>
              <li>Segment contacts based on tags and custom fields</li>
              <li>A/B test different message variations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 