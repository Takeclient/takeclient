'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, SparklesIcon, BoltIcon, ChatBubbleLeftRightIcon, HeartIcon, UserPlusIcon, TrashIcon, PencilIcon, PlayIcon, PauseIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

interface TrainingData {
  id: string;
  type: 'response' | 'trigger' | 'action';
  platform: string;
  scenario: string;
  input: string;
  expectedOutput: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

interface AutomationRule {
  id: string;
  name: string;
  platform: string;
  trigger: {
    type: 'like' | 'comment' | 'follow' | 'mention' | 'dm';
    conditions: string[];
  };
  action: {
    type: 'reply' | 'like' | 'follow' | 'dm' | 'block';
    template: string;
    delay?: number;
  };
  isActive: boolean;
  executions: number;
  lastUsed?: string;
}

interface AIInsight {
  id: string;
  type: 'performance' | 'optimization' | 'trend' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  platform?: string;
  actionable: boolean;
  createdAt: string;
}

export default function AIAgentPage() {
  const [isTraining, setIsTraining] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Training Data State
  const [trainingData, setTrainingData] = useState<TrainingData[]>([
    {
      id: '1',
      type: 'response',
      platform: 'instagram',
      scenario: 'Customer compliment',
      input: 'Love your products!',
      expectedOutput: 'Thank you so much! We\'re thrilled you love our products. Don\'t forget to tag us in your posts! 💕',
      tags: ['positive', 'appreciation', 'engagement'],
      isActive: true,
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      type: 'response',
      platform: 'facebook',
      scenario: 'Product inquiry',
      input: 'Is this available in other colors?',
      expectedOutput: 'Great question! Yes, we have this available in 5 different colors. Check out our website or DM us for the full color palette! 🎨',
      tags: ['inquiry', 'product', 'helpful'],
      isActive: true,
      createdAt: '2024-01-20T09:15:00Z'
    },
    {
      id: '3',
      type: 'action',
      platform: 'twitter',
      scenario: 'New follower',
      input: 'User follows account',
      expectedOutput: 'Send welcome DM with discount code',
      tags: ['welcome', 'new-follower', 'promotion'],
      isActive: true,
      createdAt: '2024-01-20T08:45:00Z'
    }
  ]);

  // Automation Rules State
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Welcome New Followers',
      platform: 'instagram',
      trigger: {
        type: 'follow',
        conditions: ['new_follower']
      },
      action: {
        type: 'dm',
        template: 'Welcome to our community! 🎉 Use code WELCOME15 for 15% off your first order. Shop now: {website_link}',
        delay: 300
      },
      isActive: true,
      executions: 127,
      lastUsed: '2024-01-20T11:00:00Z'
    },
    {
      id: '2',
      name: 'Engage with Post Likes',
      platform: 'facebook',
      trigger: {
        type: 'like',
        conditions: ['post_liked', 'high_engagement']
      },
      action: {
        type: 'reply',
        template: 'Thanks for the love! ❤️ Have you seen our latest collection?',
        delay: 120
      },
      isActive: true,
      executions: 89,
      lastUsed: '2024-01-20T10:45:00Z'
    },
    {
      id: '3',
      name: 'Auto-Reply to Positive Comments',
      platform: 'twitter',
      trigger: {
        type: 'comment',
        conditions: ['positive_sentiment', 'mentions_product']
      },
      action: {
        type: 'reply',
        template: 'So glad you\'re enjoying our products! Share a photo and tag us for a chance to be featured! 📸✨',
        delay: 60
      },
      isActive: false,
      executions: 45,
      lastUsed: '2024-01-19T16:20:00Z'
    }
  ]);

  // AI Insights State
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'performance',
      title: 'Peak Engagement Time Detected',
      description: 'Your Instagram posts get 65% more engagement when posted between 7-9 PM EST. Consider scheduling more content during this window.',
      impact: 'high',
      platform: 'instagram',
      actionable: true,
      createdAt: '2024-01-20T12:00:00Z'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Comment Response Rate Improvement',
      description: 'AI responses have increased comment reply rate by 85%. Consider expanding automated responses to more scenarios.',
      impact: 'high',
      platform: 'all',
      actionable: true,
      createdAt: '2024-01-20T11:30:00Z'
    },
    {
      id: '3',
      type: 'trend',
      title: 'Hashtag Performance Analysis',
      description: 'Hashtags #sustainable and #ecofriendly are trending in your niche. Adding these could increase reach by 40%.',
      impact: 'medium',
      platform: 'instagram',
      actionable: true,
      createdAt: '2024-01-20T11:00:00Z'
    },
    {
      id: '4',
      type: 'alert',
      title: 'Unusual Spike in Negative Sentiment',
      description: 'Detected 20% increase in negative comments on Facebook. Recent product launch may need attention.',
      impact: 'high',
      platform: 'facebook',
      actionable: true,
      createdAt: '2024-01-20T10:15:00Z'
    }
  ]);

  const [newTrainingData, setNewTrainingData] = useState({
    type: 'response' as 'response' | 'trigger' | 'action',
    platform: 'instagram',
    scenario: '',
    input: '',
    expectedOutput: '',
    tags: ''
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
    { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'bg-black' },
  ];

  const handleTrainAgent = async () => {
    setIsTraining(true);
    // Mock training process
    setTimeout(() => {
      setIsTraining(false);
      alert('AI Agent training completed successfully! 🎉');
    }, 3000);
  };

  const addTrainingData = () => {
    if (!newTrainingData.scenario || !newTrainingData.input || !newTrainingData.expectedOutput) {
      alert('Please fill in all required fields');
      return;
    }

    const newData: TrainingData = {
      id: Date.now().toString(),
      type: newTrainingData.type,
      platform: newTrainingData.platform,
      scenario: newTrainingData.scenario,
      input: newTrainingData.input,
      expectedOutput: newTrainingData.expectedOutput,
      tags: newTrainingData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setTrainingData(prev => [newData, ...prev]);
    setNewTrainingData({
      type: 'response',
      platform: 'instagram',
      scenario: '',
      input: '',
      expectedOutput: '',
      tags: ''
    });
  };

  const toggleTrainingData = (id: string) => {
    setTrainingData(prev => 
      prev.map(data => 
        data.id === id ? { ...data, isActive: !data.isActive } : data
      )
    );
  };

  const deleteTrainingData = (id: string) => {
    setTrainingData(prev => prev.filter(data => data.id !== id));
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const deleteAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const dismissInsight = (id: string) => {
    setAIInsights(prev => prev.filter(insight => insight.id !== id));
  };

  const getPlatformColor = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj?.color || 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string) => {
    const platformObj = platforms.find(p => p.id === platform);
    return platformObj?.icon || 'fa-share-alt';
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'alert') return 'bg-red-100 text-red-800 border-red-200';
    if (impact === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (impact === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BoltIcon className="h-5 w-5" />;
      case 'optimization':
        return <SparklesIcon className="h-5 w-5" />;
      case 'trend':
        return <SparklesIcon className="h-5 w-5" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <SparklesIcon className="h-5 w-5" />;
    }
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/social-media" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Social Media
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-3 mr-4">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Social Media Agent</h1>
              <p className="text-gray-600 mt-1">Train your AI to automatically handle social media interactions</p>
            </div>
          </div>
          <button
            onClick={handleTrainAgent}
            disabled={isTraining}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BoltIcon className="h-5 w-5 mr-2" />
            {isTraining ? 'Training...' : 'Train AI Agent'}
          </button>
        </div>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 inline" />
            Training Data
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <BoltIcon className="h-4 w-4 mr-2 inline" />
            Automation Rules
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-purple-700 shadow'
                  : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              )
            }
          >
            <SparklesIcon className="h-4 w-4 mr-2 inline" />
            AI Insights
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Training Data Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Add New Training Data */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Training Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newTrainingData.type}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="response">Response</option>
                      <option value="trigger">Trigger</option>
                      <option value="action">Action</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select
                      value={newTrainingData.platform}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      {platforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>{platform.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scenario</label>
                    <input
                      type="text"
                      value={newTrainingData.scenario}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, scenario: e.target.value }))}
                      placeholder="e.g., Customer compliment, Product inquiry, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                    <textarea
                      value={newTrainingData.input}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, input: e.target.value }))}
                      placeholder="What the user says/does..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                    <textarea
                      value={newTrainingData.expectedOutput}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, expectedOutput: e.target.value }))}
                      placeholder="How the AI should respond..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newTrainingData.tags}
                      onChange={(e) => setNewTrainingData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="positive, engagement, helpful"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={addTrainingData}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Add Training Data
                  </button>
                </div>
              </div>

              {/* Training Data List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Training Data ({trainingData.length})</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {trainingData.map((data) => (
                      <div key={data.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${getPlatformColor(data.platform)} rounded-full flex items-center justify-center`}>
                              <i className={`${getPlatformIcon(data.platform)} text-white`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">{data.scenario}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  data.type === 'response' ? 'bg-green-100 text-green-800' :
                                  data.type === 'trigger' ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {data.type}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  data.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {data.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Input:</p>
                                  <p className="text-sm text-gray-900">{data.input}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Expected Output:</p>
                                  <p className="text-sm text-gray-900">{data.expectedOutput}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {data.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleTrainingData(data.id)}
                              className={`p-2 rounded-md ${
                                data.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {data.isActive ? <CheckIcon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => deleteTrainingData(data.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Automation Rules Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Automation Rules Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Automation Rules</h2>
                    <p className="text-gray-600 mt-1">Configure automatic actions based on social media interactions</p>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    <PlayIcon className="h-4 w-4 mr-2 inline" />
                    Create Rule
                  </button>
                </div>
              </div>

              {/* Rules List */}
              <div className="grid grid-cols-1 gap-6">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${getPlatformColor(rule.platform)} rounded-lg flex items-center justify-center`}>
                          <i className={`${getPlatformIcon(rule.platform)} text-white text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 mb-1">Trigger</h4>
                              <p className="text-sm text-gray-900">
                                When someone <span className="font-medium">{rule.trigger.type}s</span>
                              </p>
                              <p className="text-xs text-gray-500">Conditions: {rule.trigger.conditions.join(', ')}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 mb-1">Action</h4>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium capitalize">{rule.action.type}</span>
                                {rule.action.delay && ` (${rule.action.delay}s delay)`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{rule.action.template}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Executions: <span className="font-medium">{rule.executions}</span></span>
                            {rule.lastUsed && (
                              <span>Last used: {new Date(rule.lastUsed).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAutomationRule(rule.id)}
                          className={`p-2 rounded-md ${
                            rule.isActive 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {rule.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAutomationRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* AI Insights Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Insights Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
                    <p className="text-gray-600 mt-1">Discover optimization opportunities and performance trends</p>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all">
                    <SparklesIcon className="h-4 w-4 mr-2 inline" />
                    Generate New Insights
                  </button>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`border rounded-lg p-6 ${getInsightColor(insight.type, insight.impact)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                          <p className="text-sm mb-4">{insight.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-xs font-medium uppercase tracking-wide">
                                {insight.type}
                              </span>
                              <span className="text-xs">
                                Impact: {insight.impact}
                              </span>
                              {insight.platform && (
                                <span className="text-xs">
                                  Platform: {insight.platform}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissInsight(insight.id)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {insight.actionable && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button className="flex-1 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                            Apply Suggestion
                          </button>
                          <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors">
                            Learn More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Performance Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Response Rate</h4>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-sm text-gray-600">Automated responses</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <HeartIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Engagement Boost</h4>
                    <p className="text-2xl font-bold text-blue-600">+67%</p>
                    <p className="text-sm text-gray-600">Since AI activation</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <UserPlusIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">New Followers</h4>
                    <p className="text-2xl font-bold text-purple-600">+142</p>
                    <p className="text-sm text-gray-600">This week</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <BoltIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Time Saved</h4>
                    <p className="text-2xl font-bold text-orange-600">18.5h</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
} 