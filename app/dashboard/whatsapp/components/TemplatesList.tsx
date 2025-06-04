'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any;
}

interface TemplatesListProps {
  integrationId: string | null;
  onRefresh: () => void;
}

export function TemplatesList({ integrationId, onRefresh }: TemplatesListProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (integrationId) {
      fetchTemplates();
    }
  }, [integrationId]);

  const fetchTemplates = async () => {
    if (!integrationId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/whatsapp/templates?integrationId=${integrationId}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const syncTemplates = async () => {
    if (!integrationId) return;

    try {
      setIsSyncing(true);
      const response = await fetch(`/api/whatsapp/templates/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      });

      if (response.ok) {
        toast.success('Templates synced successfully');
        fetchTemplates();
      } else {
        toast.error('Failed to sync templates');
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast.error('Failed to sync templates');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      AUTHENTICATION: 'bg-purple-100 text-purple-800',
      MARKETING: 'bg-blue-100 text-blue-800',
      UTILITY: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {category}
      </span>
    );
  };

  if (!integrationId) {
    return (
      <div className="text-center py-12">
        <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No integration selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please select a WhatsApp integration first
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Message Templates</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your WhatsApp Business message templates
          </p>
        </div>
        <button
          onClick={syncTemplates}
          disabled={isSyncing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync with Meta
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create templates in Meta Business Manager and sync them here
          </p>
          <button
            onClick={syncTemplates}
            className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            Sync Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                    {getStatusBadge(template.status)}
                    {getCategoryBadge(template.category)}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Language: {template.language}</p>
                  </div>

                  {/* Template Preview */}
                  {template.components && template.components.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      {template.components.map((component: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {component.type === 'HEADER' && component.text && (
                            <p className="font-medium">{component.text}</p>
                          )}
                          {component.type === 'BODY' && (
                            <p className="mt-1 whitespace-pre-wrap">{component.text}</p>
                          )}
                          {component.type === 'FOOTER' && component.text && (
                            <p className="mt-2 text-xs text-gray-500">{component.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button
                    className="px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                    onClick={() => {
                      // TODO: Implement template usage
                      toast('Template usage coming soon', { icon: '💬' });
                    }}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 