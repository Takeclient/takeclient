'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function WhatsAppContactsPage() {
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
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">WhatsApp Contacts</h1>
          <p className="mt-2 text-gray-600">
            Manage your WhatsApp contacts and sync with CRM
          </p>
          
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-green-900 mb-2">Features in Development</h3>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-2">
              <li>View all WhatsApp contacts in one place</li>
              <li>Sync WhatsApp contacts with CRM contacts</li>
              <li>Import contacts from CSV or Excel</li>
              <li>Export WhatsApp contact lists</li>
              <li>Tag and categorize WhatsApp contacts</li>
              <li>Block or unblock contacts</li>
              <li>View contact interaction history</li>
              <li>Manage opt-in/opt-out preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 