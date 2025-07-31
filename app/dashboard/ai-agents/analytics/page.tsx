'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface AnalyticsData {
  totalConversations: number;
  activeAgents: number;
  averageResponseTime: number;
  satisfactionScore: number;
  conversionRate: number;
  trends: {
    conversations: number;
    responseTime: number;
    satisfaction: number;
    conversion: number;
  };
}

interface ConversationMetric {
  date: string;
  conversations: number;
  completed: number;
  abandoned: number;
  avgDuration: number;
}

interface AgentPerformance {
  id: string;
  name: string;
  conversations: number;
  successRate: number;
  avgResponseTime: number;
  satisfaction: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AIAgentAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalConversations: 2847,
    activeAgents: 3,
    averageResponseTime: 1.2,
    satisfactionScore: 4.3,
    conversionRate: 24.5,
    trends: {
      conversations: 12.5,
      responseTime: -8.3,
      satisfaction: 5.2,
      conversion: 3.1,
    },
  };

  const conversationMetrics: ConversationMetric[] = [
    { date: '2024-01-09', conversations: 387, completed: 298, abandoned: 89, avgDuration: 8.5 },
    { date: '2024-01-10', conversations: 423, completed: 334, abandoned: 89, avgDuration: 9.2 },
    { date: '2024-01-11', conversations: 456, completed: 365, abandoned: 91, avgDuration: 8.8 },
    { date: '2024-01-12', conversations: 398, completed: 312, abandoned: 86, avgDuration: 7.9 },
    { date: '2024-01-13', conversations: 467, completed: 378, abandoned: 89, avgDuration: 9.1 },
    { date: '2024-01-14', conversations: 521, completed: 425, abandoned: 96, avgDuration: 8.7 },
    { date: '2024-01-15', conversations: 495, completed: 398, abandoned: 97, avgDuration: 9.3 },
  ];

  const agentPerformance: AgentPerformance[] = [
    {
      id: '1',
      name: 'Sales Assistant Sarah',
      conversations: 1247,
      successRate: 92.5,
      avgResponseTime: 0.8,
      satisfaction: 4.5,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Customer Support Bot',
      conversations: 987,
      successRate: 88.7,
      avgResponseTime: 1.2,
      satisfaction: 4.2,
      trend: 'stable',
    },
    {
      id: '3',
      name: 'Lead Qualifier Max',
      conversations: 613,
      successRate: 85.3,
      avgResponseTime: 1.5,
      satisfaction: 4.1,
      trend: 'down',
    },
  ];

  const topicsData = [
    { topic: 'Pricing Questions', count: 452, percentage: 23.1 },
    { topic: 'Product Features', count: 387, percentage: 19.8 },
    { topic: 'Technical Support', count: 298, percentage: 15.2 },
    { topic: 'Billing Issues', count: 234, percentage: 12.0 },
    { topic: 'Account Management', count: 187, percentage: 9.6 },
    { topic: 'Integration Help', count: 156, percentage: 8.0 },
    { topic: 'Other', count: 242, percentage: 12.3 },
  ];

  const satisfactionBreakdown = [
    { rating: 5, count: 1247, percentage: 43.8 },
    { rating: 4, count: 892, percentage: 31.3 },
    { rating: 3, count: 456, percentage: 16.0 },
    { rating: 2, count: 167, percentage: 5.9 },
    { rating: 1, count: 85, percentage: 3.0 },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAgentTrendIcon = (trend: AgentPerformance['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agent Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive performance metrics and insights for your AI agents
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Agents</option>
              <option value="1">Sales Assistant Sarah</option>
              <option value="2">Customer Support Bot</option>
              <option value="3">Lead Qualifier Max</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {analyticsData.totalConversations.toLocaleString()}
                    <span className={`ml-2 flex items-center text-sm ${getTrendColor(analyticsData.trends.conversations)}`}>
                      {getTrendIcon(analyticsData.trends.conversations)}
                      <span className="ml-1">{Math.abs(analyticsData.trends.conversations)}%</span>
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Agents</dt>
                  <dd className="text-lg font-medium text-gray-900">{analyticsData.activeAgents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {analyticsData.averageResponseTime}s
                    <span className={`ml-2 flex items-center text-sm ${getTrendColor(-analyticsData.trends.responseTime)}`}>
                      {getTrendIcon(-analyticsData.trends.responseTime)}
                      <span className="ml-1">{Math.abs(analyticsData.trends.responseTime)}%</span>
                    </span>
                  </dd>
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
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {analyticsData.satisfactionScore}/5
                    <span className={`ml-2 flex items-center text-sm ${getTrendColor(analyticsData.trends.satisfaction)}`}>
                      {getTrendIcon(analyticsData.trends.satisfaction)}
                      <span className="ml-1">{Math.abs(analyticsData.trends.satisfaction)}%</span>
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FunnelIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                  <dd className="flex items-center text-lg font-medium text-gray-900">
                    {analyticsData.conversionRate}%
                    <span className={`ml-2 flex items-center text-sm ${getTrendColor(analyticsData.trends.conversion)}`}>
                      {getTrendIcon(analyticsData.trends.conversion)}
                      <span className="ml-1">{Math.abs(analyticsData.trends.conversion)}%</span>
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Trends Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Trends</h3>
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          {conversationMetrics.map((metric, index) => (
            <div key={metric.date} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-500">
                {new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{metric.conversations} conversations</span>
                  <span className="text-xs text-gray-500">
                    ({metric.completed} completed, {metric.abandoned} abandoned)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(metric.conversations / 600) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-gray-500 text-right">
                {metric.avgDuration}min
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Agent Performance</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {agentPerformance.map((agent) => (
              <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-xs text-gray-500">{agent.conversations} conversations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAgentTrendIcon(agent.trend)}
                    <span className="text-sm text-gray-500">Performance</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="ml-1 font-medium text-green-600">{agent.successRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Response Time:</span>
                    <span className="ml-1 font-medium text-gray-900">{agent.avgResponseTime}s</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Satisfaction:</span>
                    <span className="ml-1 font-medium text-yellow-600">{agent.satisfaction}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Topics and Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Topics</h3>
          <div className="space-y-3">
            {topicsData.map((topic, index) => (
              <div key={topic.topic} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-medium text-red-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{topic.topic}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {topic.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Satisfaction Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfaction Breakdown</h3>
          <div className="space-y-3">
            {satisfactionBreakdown.map((rating) => (
              <div key={rating.rating} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {rating.rating} Star{rating.rating !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {rating.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 