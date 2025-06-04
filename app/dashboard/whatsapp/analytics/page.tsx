'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function WhatsAppAnalyticsPage() {
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
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">WhatsApp Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track performance and engagement metrics
          </p>
          
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-purple-900 mb-2">Analytics Dashboard Coming Soon</h3>
            <ul className="list-disc list-inside text-sm text-purple-800 space-y-2">
              <li>Message delivery and read rates</li>
              <li>Response time analytics</li>
              <li>Conversation volume trends</li>
              <li>Template performance metrics</li>
              <li>Customer engagement scores</li>
              <li>Agent productivity reports</li>
              <li>Export analytics data</li>
              <li>Custom date range filtering</li>
            </ul>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-600">Messages Sent</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 