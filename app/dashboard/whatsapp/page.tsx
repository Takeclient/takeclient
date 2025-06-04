'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { 
  ChatBubbleLeftRightIcon, 
  CogIcon, 
  DocumentDuplicateIcon,
  LinkIcon,
  PlusIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { WhatsAppIntegrationModal } from './components/WhatsAppIntegrationModal';
import { ConversationsList } from './components/ConversationsList';
import { TemplatesList } from './components/TemplatesList';
import { IntegrationsList } from './components/IntegrationsList';

type TabType = 'conversations' | 'integrations' | 'templates' | 'settings';

interface Integration {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
}

export default function WhatsAppPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl || 'conversations');
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (tabFromUrl && ['conversations', 'integrations', 'templates', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/whatsapp/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations);
        
        // Auto-select first active integration
        const activeIntegration = data.integrations.find((i: Integration) => i.isActive);
        if (activeIntegration && !selectedIntegration) {
          setSelectedIntegration(activeIntegration.id);
        }
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load WhatsApp integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: 'conversations' as TabType,
      name: 'Conversations',
      icon: ChatBubbleLeftRightIcon,
      count: 0
    },
    {
      id: 'integrations' as TabType,
      name: 'Integrations',
      icon: LinkIcon,
      count: integrations.length
    },
    {
      id: 'templates' as TabType,
      name: 'Templates',
      icon: DocumentDuplicateIcon,
      count: 0
    },
    {
      id: 'settings' as TabType,
      name: 'Settings',
      icon: CogIcon,
      count: null
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fab fa-whatsapp text-green-500 mr-3"></i>
              WhatsApp Business
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your WhatsApp Business conversations and integrations
            </p>
          </div>
          
          {activeTab === 'integrations' && (
            <button
              onClick={() => setShowIntegrationModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Integration
            </button>
          )}
        </div>
      </div>

      {/* Integration Status */}
      {integrations.length > 0 && activeTab !== 'integrations' && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Active Number:</label>
                <select
                  value={selectedIntegration || ''}
                  onChange={(e) => setSelectedIntegration(e.target.value)}
                  className="block w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                >
                  {integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name} ({integration.phoneNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                {integrations.find(i => i.id === selectedIntegration)?.isActive ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <nav className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'conversations' && (
              <ConversationsList 
                integrationId={selectedIntegration} 
                onNewConversation={() => {}}
              />
            )}
            
            {activeTab === 'integrations' && (
              <IntegrationsList 
                integrations={integrations}
                onRefresh={fetchIntegrations}
                onEdit={() => {}}
              />
            )}
            
            {activeTab === 'templates' && (
              <TemplatesList 
                integrationId={selectedIntegration}
                onRefresh={() => {}}
              />
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Settings</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Webhook URL</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Configure this URL in your Meta Business Manager webhook settings:
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/api/whatsapp/webhook`}
                            className="flex-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                              toast.success('Webhook URL copied!');
                            }}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Auto-sync Contacts</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Automatically create or update CRM contacts from WhatsApp conversations
                        </p>
                        <label className="mt-2 inline-flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable auto-sync</span>
                        </label>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Message Notifications</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Get notified when you receive new WhatsApp messages
                        </p>
                        <label className="mt-2 inline-flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Integration Modal */}
      {showIntegrationModal && (
        <WhatsAppIntegrationModal
          isOpen={showIntegrationModal}
          onClose={() => setShowIntegrationModal(false)}
          onSuccess={() => {
            setShowIntegrationModal(false);
            fetchIntegrations();
          }}
        />
      )}
    </div>
  );
} 