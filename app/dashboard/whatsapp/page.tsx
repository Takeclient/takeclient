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
  ExclamationCircleIcon,
  InformationCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { WhatsAppIntegrationModal } from './components/WhatsAppIntegrationModal';
import { ConversationsList } from './components/ConversationsList';
import { TemplatesList } from './components/TemplatesList';
import { IntegrationsList } from './components/IntegrationsList';
import { WhatsAppSetupGuide } from './components/WhatsAppSetupGuide';
import { MetaConnectSetup } from './components/MetaConnectSetup';

type TabType = 'conversations' | 'integrations' | 'templates' | 'settings' | 'setup-guide';

interface Integration {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  businessAccountId?: string;
  lastSync?: string;
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
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [currentSetupMethod, setCurrentSetupMethod] = useState<'meta' | 'manual' | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (tabFromUrl && ['conversations', 'integrations', 'templates', 'settings', 'setup-guide'].includes(tabFromUrl)) {
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

  const syncIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/integrations/${integrationId}/sync`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success('Integration synced successfully');
        fetchIntegrations();
      } else {
        toast.error('Failed to sync integration');
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast.error('Failed to sync integration');
    }
  };

  const tabs = [
    {
      id: 'conversations' as TabType,
      name: 'Conversations',
      icon: ChatBubbleLeftRightIcon,
      count: 0,
      description: 'Manage customer conversations'
    },
    {
      id: 'integrations' as TabType,
      name: 'Integrations',
      icon: LinkIcon,
      count: integrations.length,
      description: 'WhatsApp Business connections'
    },
    {
      id: 'templates' as TabType,
      name: 'Templates',
      icon: DocumentDuplicateIcon,
      count: 0,
      description: 'Message templates'
    },
    {
      id: 'setup-guide' as TabType,
      name: 'Setup Guide',
      icon: BookOpenIcon,
      count: null,
      description: 'Step-by-step setup instructions'
    },
    {
      id: 'settings' as TabType,
      name: 'Settings',
      icon: CogIcon,
      count: null,
      description: 'Configuration & preferences'
    }
  ];

  const hasActiveIntegration = integrations.some(i => i.isActive);

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
              Manage your WhatsApp Business conversations, integrations, and customer communications
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {!hasActiveIntegration && (
              <button
                onClick={() => setShowSetupGuide(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Setup Guide
              </button>
            )}
            
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
      </div>

      {/* Status Banner */}
      {!hasActiveIntegration && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to WhatsApp Business Integration
              </h3>
              <p className="text-gray-700 mb-4">
                Connect your WhatsApp Business account to start managing customer conversations directly from your CRM. 
                Get detailed setup instructions and manage all your business communications in one place.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('setup-guide')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  View Setup Guide
                </button>
                <button
                  onClick={() => setShowIntegrationModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Quick Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {integrations.find(i => i.id === selectedIntegration)?.isActive ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-600 font-medium">Disconnected</span>
                    </>
                  )}
                </div>
                
                {selectedIntegration && (
                  <button
                    onClick={() => syncIntegration(selectedIntegration)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sync Now
                  </button>
                )}
              </div>
            </div>
            
            {integrations.find(i => i.id === selectedIntegration)?.lastSync && (
              <div className="mt-2 text-xs text-gray-500">
                Last synced: {new Date(integrations.find(i => i.id === selectedIntegration)?.lastSync || Date.now()).toLocaleString()}
              </div>
            )}
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
              className={`flex-1 flex flex-col items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={tab.description}
            >
              <div className="flex items-center">
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
              </div>
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
                integrations={integrations}
              />
            )}
            
            {activeTab === 'integrations' && (
              <IntegrationsList 
                integrations={integrations}
                onRefresh={fetchIntegrations}
                onEdit={() => {}}
                onSync={syncIntegration}
              />
            )}
            
            {activeTab === 'templates' && (
              <TemplatesList 
                integrationId={selectedIntegration}
                onRefresh={() => {}}
              />
            )}
            
            {activeTab === 'setup-guide' && (
              <div>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Choose Your Setup Method
                  </h2>
                  <p className="text-gray-600">
                    Select how you'd like to connect WhatsApp to your CRM
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Meta Connect Option */}
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <LinkIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Connect via Meta (Recommended)
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Automatically discover your WhatsApp Business accounts using your existing Meta Business connection.
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1 mb-4">
                        <li>✅ Automatic discovery</li>
                        <li>✅ No manual credential copying</li>
                        <li>✅ Uses existing Meta connection</li>
                        <li>✅ Faster setup</li>
                      </ul>
                      <button
                        onClick={() => setCurrentSetupMethod('meta')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use Meta Connect
                      </button>
                    </div>
                  </div>

                  {/* Manual Setup Option */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <CogIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Manual Setup
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Follow step-by-step instructions to manually configure your WhatsApp Business API connection.
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1 mb-4">
                        <li>🔧 Full control over setup</li>
                        <li>📋 Step-by-step guide</li>
                        <li>🛠️ Advanced configuration options</li>
                        <li>📞 Direct credential input</li>
                      </ul>
                      <button
                        onClick={() => setCurrentSetupMethod('manual')}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Manual Setup
                      </button>
                    </div>
                  </div>
                </div>

                {/* Show selected setup method */}
                {currentSetupMethod === 'meta' && (
                  <MetaConnectSetup 
                    onComplete={() => {
                      setActiveTab('integrations');
                      fetchIntegrations();
                    }}
                  />
                )}

                {currentSetupMethod === 'manual' && (
                  <WhatsAppSetupGuide 
                    onComplete={() => {
                      setActiveTab('integrations');
                      setShowIntegrationModal(true);
                    }}
                  />
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">WhatsApp Configuration</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Webhook Settings */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Webhook Configuration</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure this URL in your Meta Business Manager webhook settings:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Webhook URL</label>
                          <div className="flex items-center space-x-2">
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
                          <label className="block text-xs font-medium text-gray-600 mb-1">Verify Token</label>
                          <input
                            type="text"
                            readOnly
                            value="whatsapp_webhook_verify_token"
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* General Settings */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              defaultChecked
                            />
                            <span className="ml-2 text-sm text-gray-700">Auto-sync Contacts</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Automatically create or update CRM contacts from WhatsApp conversations
                          </p>
                        </div>
                        
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              defaultChecked
                            />
                            <span className="ml-2 text-sm text-gray-700">Message Notifications</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Get notified when you receive new WhatsApp messages
                          </p>
                        </div>

                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              defaultChecked
                            />
                            <span className="ml-2 text-sm text-gray-700">Auto-assign Conversations</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Automatically assign new conversations to team members
                          </p>
                        </div>

                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Business Hours Only</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Only send automated responses during business hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Advanced Settings</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Message Routing</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Assignee
                          </label>
                          <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500">
                            <option>Auto-assign</option>
                            <option>Sales Team</option>
                            <option>Support Team</option>
                            <option>Specific User</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority Level
                          </label>
                          <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500">
                            <option>Normal</option>
                            <option>High</option>
                            <option>Urgent</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Integration Limits</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Messages per hour:</span>
                          <span className="font-medium">1000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active integrations:</span>
                          <span className="font-medium">{integrations.length}/5</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Template messages:</span>
                          <span className="font-medium">250/month</span>
                        </div>
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

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <WhatsAppSetupGuide
          isModal={true}
          onClose={() => setShowSetupGuide(false)}
          onComplete={() => {
            setShowSetupGuide(false);
            setActiveTab('integrations');
            setShowIntegrationModal(true);
          }}
        />
      )}
    </div>
  );
} 