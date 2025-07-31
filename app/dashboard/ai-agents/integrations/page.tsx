'use client';

import { useState } from 'react';
import {
  PlusIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'messaging' | 'website' | 'social' | 'crm' | 'ecommerce' | 'api';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  connectedAgents: number;
  lastSync?: string;
  setupComplexity: 'easy' | 'medium' | 'advanced';
  features: string[];
  requiresAuth: boolean;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export default function AIAgentIntegrations() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAPIKeys, setShowAPIKeys] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});

  const integrations: Integration[] = [
    {
      id: 'website-widget',
      name: 'Website Widget',
      description: 'Embed AI agents directly into your website with a customizable chat widget',
      category: 'website',
      status: 'connected',
      icon: '🌐',
      connectedAgents: 2,
      lastSync: '2024-01-15T10:30:00Z',
      setupComplexity: 'easy',
      features: ['Customizable appearance', 'Mobile responsive', 'Multiple agents support'],
      requiresAuth: false,
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      description: 'Connect agents to WhatsApp Business API for customer conversations',
      category: 'messaging',
      status: 'connected',
      icon: '💬',
      connectedAgents: 1,
      lastSync: '2024-01-15T09:45:00Z',
      setupComplexity: 'medium',
      features: ['Rich messages', 'Media support', 'Read receipts', 'Business profile'],
      requiresAuth: true,
    },
    {
      id: 'facebook-messenger',
      name: 'Facebook Messenger',
      description: 'Deploy agents on Facebook Messenger for social media customer service',
      category: 'messaging',
      status: 'disconnected',
      icon: '📘',
      connectedAgents: 0,
      setupComplexity: 'medium',
      features: ['Instant replies', 'Rich cards', 'Quick replies', 'Persistent menu'],
      requiresAuth: true,
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Create Telegram bots powered by your AI agents',
      category: 'messaging',
      status: 'pending',
      icon: '✈️',
      connectedAgents: 0,
      setupComplexity: 'easy',
      features: ['Inline keyboards', 'File sharing', 'Group chat support'],
      requiresAuth: true,
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Add AI agents to Slack workspaces for internal support',
      category: 'messaging',
      status: 'disconnected',
      icon: '💼',
      connectedAgents: 0,
      setupComplexity: 'medium',
      features: ['Channel support', 'Direct messages', 'Slash commands', 'App mentions'],
      requiresAuth: true,
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect agents to thousands of apps through Zapier automation',
      category: 'api',
      status: 'connected',
      icon: '⚡',
      connectedAgents: 3,
      lastSync: '2024-01-15T08:20:00Z',
      setupComplexity: 'medium',
      features: ['Workflow automation', '5000+ app integrations', 'Trigger actions'],
      requiresAuth: true,
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Integrate with Shopify stores for e-commerce customer support',
      category: 'ecommerce',
      status: 'error',
      icon: '🛒',
      connectedAgents: 0,
      setupComplexity: 'advanced',
      features: ['Order tracking', 'Product recommendations', 'Inventory updates'],
      requiresAuth: true,
    },
    {
      id: 'rest-api',
      name: 'REST API',
      description: 'Custom integration using our REST API for maximum flexibility',
      category: 'api',
      status: 'connected',
      icon: '🔗',
      connectedAgents: 2,
      setupComplexity: 'advanced',
      features: ['Full control', 'Custom endpoints', 'Webhook support', 'Real-time updates'],
      requiresAuth: true,
    },
  ];

  const apiKeys: APIKey[] = [
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk-ai-prod-1234567890abcdef',
      permissions: ['agents:read', 'agents:write', 'conversations:read'],
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-15T10:30:00Z',
      isActive: true,
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk-ai-dev-abcdef1234567890',
      permissions: ['agents:read', 'conversations:read'],
      createdAt: '2024-01-10T00:00:00Z',
      lastUsed: '2024-01-14T15:20:00Z',
      isActive: true,
    },
    {
      id: '3',
      name: 'Legacy Key (Deprecated)',
      key: 'sk-ai-legacy-9876543210fedcba',
      permissions: ['agents:read'],
      createdAt: '2023-12-01T00:00:00Z',
      lastUsed: '2024-01-05T12:00:00Z',
      isActive: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'messaging', name: 'Messaging', count: integrations.filter(i => i.category === 'messaging').length },
    { id: 'website', name: 'Website', count: integrations.filter(i => i.category === 'website').length },
    { id: 'api', name: 'API', count: integrations.filter(i => i.category === 'api').length },
    { id: 'ecommerce', name: 'E-commerce', count: integrations.filter(i => i.category === 'ecommerce').length },
  ];

  const filteredIntegrations = integrations.filter(integration => {
    return selectedCategory === 'all' || integration.category === selectedCategory;
  });

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>;
      default:
        return null;
    }
  };

  const getComplexityColor = (complexity: Integration['setupComplexity']) => {
    switch (complexity) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleGenerateAPIKey = async () => {
    setIsGeneratingKey(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingKey(false);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '...' + key.substring(key.length - 8);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your AI agents to various platforms and manage API access
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={() => setShowAPIKeys(!showAPIKeys)}>
            <KeyIcon className="h-4 w-4 mr-2" />
            {showAPIKeys ? 'Hide API Keys' : 'Manage API Keys'}
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* API Keys Management */}
      {showAPIKeys && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
            <Button onClick={handleGenerateAPIKey} disabled={isGeneratingKey}>
              {isGeneratingKey ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Generate New Key
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${apiKey.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                      <p className="text-xs text-gray-500">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKeyValues[apiKey.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {showKeyValues[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {apiKey.permissions.map((permission) => (
                    <span key={permission} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Categories */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <div key={integration.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(integration.status)}`}>
                        {integration.status}
                      </span>
                      {integration.requiresAuth && (
                        <KeyIcon className="h-3 w-3 text-gray-400" title="Requires authentication" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(integration.status)}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

              {/* Integration Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Connected Agents:</span>
                  <span className="ml-1 font-medium text-gray-900">{integration.connectedAgents}</span>
                </div>
                <div>
                  <span className="text-gray-500">Complexity:</span>
                  <span className={`ml-1 font-medium capitalize ${getComplexityColor(integration.setupComplexity)}`}>
                    {integration.setupComplexity}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              {integration.lastSync && (
                <div className="text-xs text-gray-500 mb-4">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 2).map((feature) => (
                    <span key={feature} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 2 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{integration.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {integration.status === 'connected' ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Cog6ToothIcon className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      Disconnect
                    </Button>
                  </>
                ) : integration.status === 'error' ? (
                  <>
                    <Button size="sm" className="flex-1">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      Fix Error
                    </Button>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" className="flex-1">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Integrations Found */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try selecting a different category or add a new integration.
          </p>
        </div>
      )}

      {/* Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <CodeBracketIcon className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Need help with integrations?</h3>
            <p className="text-sm text-blue-700 mb-4">
              Check our comprehensive documentation for step-by-step setup guides, API references, and troubleshooting tips.
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 