'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface WhatsAppIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WhatsAppIntegrationModal({ isOpen, onClose, onSuccess }: WhatsAppIntegrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    webhookVerifyToken: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phoneNumber || !formData.phoneNumberId || 
        !formData.businessAccountId || !formData.accessToken) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/whatsapp/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('WhatsApp integration added successfully');
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add integration');
      }
    } catch (error) {
      console.error('Error adding integration:', error);
      toast.error('Failed to add integration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Add WhatsApp Business Integration
                    </Dialog.Title>

                    {/* Instructions */}
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">Setup Instructions</h4>
                          <div className="mt-2 text-sm text-blue-700">
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Meta Business Manager → WhatsApp Manager</li>
                              <li>Select your WhatsApp Business Account</li>
                              <li>Navigate to Settings → API Setup</li>
                              <li>Copy the required credentials below</li>
                              <li>Generate a permanent access token</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Integration Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Main Business Number"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            WhatsApp Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="+1234567890"
                          />
                          <p className="mt-1 text-xs text-gray-500">Include country code</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.phoneNumberId}
                            onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="1234567890123456"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          WhatsApp Business Account ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.businessAccountId}
                          onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="1234567890123456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Access Token <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.accessToken}
                          onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="EAAxxxxxxxxx..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Use a permanent token, not a temporary one
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Webhook Verify Token
                        </label>
                        <input
                          type="text"
                          value={formData.webhookVerifyToken}
                          onChange={(e) => setFormData({ ...formData, webhookVerifyToken: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="my-verify-token"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Optional: Used to verify webhook requests
                        </p>
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Adding...' : 'Add Integration'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 