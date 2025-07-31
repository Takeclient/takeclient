'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  GlobeAltIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training' | 'draft';
  type: 'chat' | 'voice' | 'hybrid';
  personality: string;
  trainedOn: number; // number of training samples
  conversations: number;
  successRate: number;
  lastActive: string;
  platforms: string[]; // where it's deployed
  avatar?: string;
  createdAt: string;
}

export default function AIAgentHub() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'training'>('all');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - will be replaced with API call
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Sales Assistant Sarah',
          description: 'Helps qualify leads and book appointments for our sales team',
          status: 'active',
          type: 'chat',
          personality: 'Professional and helpful',
          trainedOn: 1250,
          conversations: 847,
          successRate: 92.5,
          lastActive: '2024-01-15T10:30:00Z',
          platforms: ['website', 'landing-page'],
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Customer Support Bot',
          description: 'Handles common customer inquiries and support tickets',
          status: 'active',
          type: 'hybrid',
          personality: 'Friendly and solution-focused',
          trainedOn: 2100,
          conversations: 1542,
          successRate: 88.7,
          lastActive: '2024-01-15T09:45:00Z',
          platforms: ['website', 'whatsapp'],
          createdAt: '2024-01-05T00:00:00Z',
        },
        {
          id: '3',
          name: 'Lead Qualifier Max',
          description: 'Qualifies incoming leads and collects contact information',
          status: 'training',
          type: 'chat',
          personality: 'Curious and engaging',
          trainedOn: 450,
          conversations: 0,
          successRate: 0,
          lastActive: 'Never',
          platforms: [],
          createdAt: '2024-01-14T00:00:00Z',
        },
      ];
      
      setAgents(mockAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Agent['type']) => {
    switch (type) {
      case 'chat':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'voice':
        return <SparklesIcon className="h-5 w-5" />;
      case 'hybrid':
        return <GlobeAltIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      website: 'bg-blue-100 text-blue-800',
      'landing-page': 'bg-purple-100 text-purple-800',
      whatsapp: 'bg-green-100 text-green-800',
      facebook: 'bg-blue-100 text-blue-800',
      telegram: 'bg-cyan-100 text-cyan-800',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate total stats
  const totalStats = {
    totalAgents: agents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalConversations: agents.reduce((sum, a) => sum + a.conversations, 0),
    averageSuccessRate: agents.length > 0 
      ? agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length 
      : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agent Hub</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, train, and deploy intelligent conversational agents
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/dashboard/ai-agents/templates">
            <Button variant="outline">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/ai-agents/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RocketLaunchIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.totalAgents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Agents</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.activeAgents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversations</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalStats.totalConversations.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalStats.averageSuccessRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard/ai-agents/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Create New Agent</h4>
                <p className="text-sm text-gray-500">Build a custom AI agent from scratch</p>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/ai-agents/templates"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <SparklesIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Use Template</h4>
                <p className="text-sm text-gray-500">Start with pre-built agent templates</p>
              </div>
            </Link>
            
            <Link 
              href="/dashboard/ai-agents/training"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Training Center</h4>
                <p className="text-sm text-gray-500">Improve your agents with training</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Your AI Agents</h3>
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', count: agents.length },
                { key: 'active', label: 'Active', count: agents.filter(a => a.status === 'active').length },
                { key: 'training', label: 'Training', count: agents.filter(a => a.status === 'training').length },
                { key: 'inactive', label: 'Inactive', count: agents.filter(a => a.status === 'inactive').length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    filter === tab.key
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="p-6">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'Get started by creating your first AI agent.'
                  : `No ${filter} agents found.`
                }
              </p>
              {filter === 'all' && (
                <div className="mt-6">
                  <Link href="/dashboard/ai-agents/create">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Your First Agent
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(agent.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{agent.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Agent Description */}
                  <p className="text-sm text-gray-600 mb-4">{agent.description}</p>

                  {/* Agent Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{agent.conversations}</div>
                      <div className="text-xs text-gray-500">Conversations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{agent.successRate}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>

                  {/* Platforms */}
                  {agent.platforms.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Deployed on:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.platforms.map((platform) => (
                          <span
                            key={platform}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlatformBadge(platform)}`}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Active */}
                  <div className="text-xs text-gray-500 mb-4">
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    Last active: {formatDate(agent.lastActive)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {agent.status === 'active' ? (
                      <Button size="sm" variant="outline" className="flex-1">
                        <PauseIcon className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1">
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Link href={`/dashboard/ai-agents/conversations?agent=${agent.id}`}>
                      <Button size="sm" variant="outline">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 