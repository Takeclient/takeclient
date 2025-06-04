'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type ProviderType = 'INTERNAL_SMTP' | 'SENDGRID' | 'MAILGUN' | 'AWS_SES' | 'POSTMARK' | 'SMTP2GO' | 'SENDINBLUE' | 'MAILCHIMP';

interface ProviderConfig {
  name: string;
  icon: string;
  description: string;
  fields: string[];
}

const providerConfigs: Record<ProviderType, ProviderConfig> = {
  INTERNAL_SMTP: {
    name: 'Internal SMTP',
    icon: '🏠',
    description: 'Use your own SMTP server',
    fields: ['smtp'],
  },
  SENDGRID: {
    name: 'SendGrid',
    icon: '📧',
    description: 'Popular email delivery service',
    fields: ['api'],
  },
  MAILGUN: {
    name: 'Mailgun',
    icon: '🔫',
    description: 'Developer-friendly email service',
    fields: ['api'],
  },
  AWS_SES: {
    name: 'Amazon SES',
    icon: '☁️',
    description: 'Scalable email service by AWS',
    fields: ['api'],
  },
  POSTMARK: {
    name: 'Postmark',
    icon: '📮',
    description: 'Transactional email service',
    fields: ['api'],
  },
  SMTP2GO: {
    name: 'SMTP2GO',
    icon: '🚀',
    description: 'Global email delivery platform',
    fields: ['api'],
  },
  SENDINBLUE: {
    name: 'Sendinblue',
    icon: '💙',
    description: 'All-in-one marketing platform',
    fields: ['api'],
  },
  MAILCHIMP: {
    name: 'Mailchimp',
    icon: '🐵',
    description: 'Marketing automation platform',
    fields: ['api'],
  },
};

export default function NewProviderPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ProviderType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    isDefault: false,
    
    // SMTP settings
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    
    // API settings
    apiKey: '',
    apiSecret: '',
    
    // Sender settings
    defaultFromEmail: '',
    defaultFromName: '',
    replyToEmail: '',
    
    // Rate limits
    dailyLimit: 0,
    hourlyLimit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast.error('Please select a provider type');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/email-marketing/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: selectedType,
          dailyLimit: formData.dailyLimit || undefined,
          hourlyLimit: formData.hourlyLimit || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create provider');
      }

      toast.success('Email provider added successfully!');
      router.push('/dashboard/email-marketing?tab=providers');
    } catch (error) {
      console.error('Error creating provider:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/email-marketing?tab=providers')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Email Marketing
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Add Email Provider</h1>
          <p className="text-gray-600 mt-1">Configure a new email service provider</p>
        </div>

        {!selectedType ? (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Provider Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(providerConfigs).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as ProviderType)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{config.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{config.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">{providerConfigs[selectedType].icon}</span>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Configure {providerConfigs[selectedType].name}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change provider type
                </button>
              </div>
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Basic Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={`My ${providerConfigs[selectedType].name}`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default provider
                </label>
              </div>
            </div>

            {/* SMTP Settings */}
            {selectedType === 'INTERNAL_SMTP' && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">SMTP Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      placeholder="smtp.example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      name="smtpPort"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      placeholder="587"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      name="smtpUser"
                      value={formData.smtpUser}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      name="smtpPass"
                      value={formData.smtpPass}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="smtpSecure"
                    id="smtpSecure"
                    checked={formData.smtpSecure}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smtpSecure" className="ml-2 text-sm text-gray-700">
                    Use secure connection (TLS/SSL)
                  </label>
                </div>
              </div>
            )}

            {/* API Settings */}
            {selectedType !== 'INTERNAL_SMTP' && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">API Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    placeholder="Your API key"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {['MAILGUN', 'AWS_SES'].includes(selectedType) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret / Domain
                    </label>
                    <input
                      type="password"
                      name="apiSecret"
                      value={formData.apiSecret}
                      onChange={handleChange}
                      placeholder={selectedType === 'MAILGUN' ? 'Your domain' : 'Your API secret'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sender Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Sender Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    name="defaultFromEmail"
                    value={formData.defaultFromEmail}
                    onChange={handleChange}
                    placeholder="noreply@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default From Name
                  </label>
                  <input
                    type="text"
                    name="defaultFromName"
                    value={formData.defaultFromName}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    name="replyToEmail"
                    value={formData.replyToEmail}
                    onChange={handleChange}
                    placeholder="support@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Rate Limits (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Limit
                  </label>
                  <input
                    type="number"
                    name="dailyLimit"
                    value={formData.dailyLimit}
                    onChange={handleChange}
                    placeholder="0 for unlimited"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Limit
                  </label>
                  <input
                    type="number"
                    name="hourlyLimit"
                    value={formData.hourlyLimit}
                    onChange={handleChange}
                    placeholder="0 for unlimited"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard/email-marketing?tab=providers')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Provider...' : 'Add Provider'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 