'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  RocketLaunchIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface EmailList {
  id: string;
  name: string;
  subscriberCount: number;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  defaultFromEmail?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lists, setLists] = useState<EmailList[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    content: '',
    type: 'REGULAR',
    providerId: '',
    listIds: [] as string[],
    templateId: '',
    scheduledAt: '',
    trackOpens: true,
    trackClicks: true,
    preheaderText: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch email lists
      const listsResponse = await fetch('/api/email-marketing/lists');
      if (listsResponse.ok) {
        const listsData = await listsResponse.json();
        setLists(listsData.lists || []);
      }

      // Fetch providers
      const providersResponse = await fetch('/api/email-marketing/providers');
      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        setProviders(providersData.providers || []);
        
        // Set default provider
        const defaultProvider = providersData.providers?.find((p: Provider) => p.isActive);
        if (defaultProvider) {
          setFormData(prev => ({
            ...prev,
            providerId: defaultProvider.id,
            fromEmail: defaultProvider.defaultFromEmail || '',
          }));
        }
      }

      // Fetch templates
      const templatesResponse = await fetch('/api/email-marketing/templates');
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Campaign name is required');
      return;
    }
    
    if (!formData.subject) {
      toast.error('Subject line is required');
      return;
    }
    
    if (!formData.content) {
      toast.error('Email content is required');
      return;
    }
    
    if (formData.listIds.length === 0) {
      toast.error('Please select at least one email list');
      return;
    }
    
    if (!formData.providerId) {
      toast.error('Please select an email provider');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/email-marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Campaign created successfully');
        router.push(`/dashboard/email-marketing/campaigns/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'SENDGRID':
        return '📧';
      case 'MAILGUN':
        return '🔫';
      case 'AWS_SES':
        return '☁️';
      case 'INTERNAL_SMTP':
        return '🏠';
      default:
        return '📮';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/email-marketing/campaigns"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>
        
        <div className="flex items-center">
          <RocketLaunchIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Email Campaign</h1>
            <p className="text-sm text-gray-500">Create a new email marketing campaign</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Details */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Campaign Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monthly Newsletter - January 2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="REGULAR">Regular Campaign</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="PROMOTIONAL">Promotional</option>
                <option value="TRANSACTIONAL">Transactional</option>
                <option value="AUTOMATED">Automated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Content</h2>
          
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Template (Optional)
              </label>
              <select
                value={formData.templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Start from scratch</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email subject line"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preheader Text
              </label>
              <input
                type="text"
                value={formData.preheaderText}
                onChange={(e) => setFormData({ ...formData, preheaderText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Preview text that appears after the subject line"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email content (HTML supported)"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can use HTML tags for formatting. Variables like {'{'}firstName{'}'} will be replaced with subscriber data.
              </p>
            </div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sender Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Name *
              </label>
              <input
                type="text"
                required
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Name or Company Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Email *
              </label>
              <input
                type="email"
                required
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="noreply@yourcompany.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reply-To Email
              </label>
              <input
                type="email"
                value={formData.replyToEmail}
                onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="support@yourcompany.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Provider *
              </label>
              <select
                required
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a provider</option>
                {providers.filter(p => p.isActive).map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {getProviderIcon(provider.type)} {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recipients</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Email Lists *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
              {lists.length === 0 ? (
                <div className="text-center py-4">
                  <UserGroupIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">No email lists found</p>
                  <Link
                    href="/dashboard/email-marketing/lists/new"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Create your first list
                  </Link>
                </div>
              ) : (
                lists.map(list => (
                  <label key={list.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.listIds.includes(list.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            listIds: [...formData.listIds, list.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            listIds: formData.listIds.filter(id => id !== list.id)
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {list.name} ({list.subscriberCount} subscribers)
                    </span>
                  </label>
                ))
              )}
            </div>
            {formData.listIds.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Total recipients: {lists
                  .filter(list => formData.listIds.includes(list.id))
                  .reduce((sum, list) => sum + list.subscriberCount, 0)
                  .toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Scheduling & Settings */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Scheduling & Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send Time
              </label>
              <select
                value={formData.scheduledAt ? 'scheduled' : 'now'}
                onChange={(e) => {
                  if (e.target.value === 'now') {
                    setFormData({ ...formData, scheduledAt: '' });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="now">Send immediately</option>
                <option value="scheduled">Schedule for later</option>
              </select>
            </div>
            
            {formData.scheduledAt !== '' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.trackOpens}
                onChange={(e) => setFormData({ ...formData, trackOpens: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
              />
              <span className="text-sm text-gray-700">Track email opens</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.trackClicks}
                onChange={(e) => setFormData({ ...formData, trackClicks: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
              />
              <span className="text-sm text-gray-700">Track link clicks</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/email-marketing/campaigns">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
} 