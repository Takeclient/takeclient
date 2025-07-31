'use client';

import { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  userId: string;
  userName: string;
  platform: string;
  status: 'active' | 'completed' | 'abandoned';
  messageCount: number;
  satisfaction?: number;
  startedAt: string;
  lastActivity: string;
  preview: string;
}

export default function AgentConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      agentId: '1',
      agentName: 'Sales Assistant Sarah',
      userId: 'user_001',
      userName: 'John Smith',
      platform: 'website',
      status: 'completed',
      messageCount: 12,
      satisfaction: 4.5,
      startedAt: '2024-01-15T09:30:00Z',
      lastActivity: '2024-01-15T09:45:00Z',
      preview: 'Hi, I\'m interested in learning more about your pricing plans...',
    },
    {
      id: '2',
      agentId: '2',
      agentName: 'Customer Support Bot',
      userId: 'user_002',
      userName: 'Sarah Johnson',
      platform: 'whatsapp',
      status: 'active',
      messageCount: 8,
      startedAt: '2024-01-15T10:15:00Z',
      lastActivity: '2024-01-15T10:30:00Z',
      preview: 'I need help with my recent order. The tracking shows...',
    },
    {
      id: '3',
      agentId: '1',
      agentName: 'Sales Assistant Sarah',
      userId: 'user_003',
      userName: 'Mike Wilson',
      platform: 'landing-page',
      status: 'abandoned',
      messageCount: 3,
      startedAt: '2024-01-15T08:20:00Z',
      lastActivity: '2024-01-15T08:22:00Z',
      preview: 'Hello, I saw your ad on Facebook and wanted to know...',
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const agents = [
    { id: 'all', name: 'All Agents' },
    { id: '1', name: 'Sales Assistant Sarah' },
    { id: '2', name: 'Customer Support Bot' },
    { id: '3', name: 'Lead Qualifier Max' },
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesAgent = selectedAgent === 'all' || conv.agentId === selectedAgent;
    const matchesStatus = selectedStatus === 'all' || conv.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAgent && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Conversation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'website':
        return '🌐';
      case 'whatsapp':
        return '💬';
      case 'landing-page':
        return '📄';
      case 'facebook':
        return '📘';
      default:
        return '💻';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Calculate stats
  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    completed: conversations.filter(c => c.status === 'completed').length,
    abandoned: conversations.filter(c => c.status === 'abandoned').length,
    avgSatisfaction: conversations
      .filter(c => c.satisfaction)
      .reduce((sum, c) => sum + (c.satisfaction || 0), 0) / 
      conversations.filter(c => c.satisfaction).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Conversations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage all conversations across your AI agents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Abandoned</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.abandoned}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-yellow-400 text-xl">⭐</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Satisfaction</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.avgSatisfaction ? stats.avgSatisfaction.toFixed(1) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          
          <div className="sm:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Conversations ({filteredConversations.length})
          </h3>
        </div>
        
        <div className="p-6">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedAgent !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Conversations will appear here once your agents start chatting with users.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => (
                <div key={conversation.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{conversation.userName}</h4>
                          <span className="text-2xl">{getPlatformIcon(conversation.platform)}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(conversation.status)}`}>
                            {conversation.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{conversation.agentName}</p>
                        
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {conversation.preview}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                            {conversation.messageCount} messages
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {getTimeSince(conversation.lastActivity)}
                          </span>
                          {conversation.satisfaction && (
                            <span className="flex items-center">
                              ⭐ {conversation.satisfaction}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {conversation.status === 'active' && (
                        <Button size="sm">
                          <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
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