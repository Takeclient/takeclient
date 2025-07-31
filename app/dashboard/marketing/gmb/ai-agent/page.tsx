'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';

// Types for GMB AI Agent
interface TrainingData {
  id: string;
  reviewText: string;
  rating: number;
  expectedResponse: string;
  category: 'positive' | 'negative' | 'neutral' | 'question' | 'complaint';
  status: 'active' | 'inactive';
  businessType?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'new_review' | 'rating_threshold' | 'keyword_match' | 'review_sentiment';
    conditions: {
      rating?: number;
      keywords?: string[];
      sentiment?: 'positive' | 'negative' | 'neutral';
      operator?: 'greater_than' | 'less_than' | 'equals' | 'contains';
    };
  };
  action: {
    type: 'auto_reply' | 'flag_for_review' | 'block_review' | 'notify_owner' | 'escalate';
    template?: string;
    delay?: number; // minutes
  };
  isActive: boolean;
  executionCount: number;
  createdAt: Date;
}

interface AIInsight {
  id: string;
  type: 'review_trend' | 'response_performance' | 'rating_analysis' | 'keyword_insight' | 'competitor_analysis';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics?: {
    label: string;
    value: string | number;
    change?: string;
  }[];
  recommendations?: string[];
  createdAt: Date;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function GMBAIAgentPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock training data for GMB reviews
  const [trainingData, setTrainingData] = useState<TrainingData[]>([
    {
      id: '1',
      reviewText: 'Amazing service! The staff was incredibly helpful and professional.',
      rating: 5,
      expectedResponse: 'Thank you so much for your wonderful review! We\'re thrilled to hear about your positive experience with our team. Your feedback means the world to us and motivates us to continue providing excellent service.',
      category: 'positive',
      status: 'active',
      businessType: 'service',
      tags: ['excellent service', 'professional staff'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      reviewText: 'Poor customer service. Had to wait 30 minutes just to be seen.',
      rating: 2,
      expectedResponse: 'We sincerely apologize for the long wait time and the inconvenience this caused. This is not the standard of service we strive for. We\'re reviewing our scheduling process to prevent this from happening again. Please contact us directly so we can make this right.',
      category: 'negative',
      status: 'active',
      businessType: 'service',
      tags: ['wait time', 'customer service'],
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '3',
      reviewText: 'Do you offer delivery services?',
      rating: 3,
      expectedResponse: 'Thank you for your interest! Yes, we do offer delivery services within a 5-mile radius. You can place orders through our website or call us directly. Delivery fees start at $3.99. Is there anything specific you\'d like to order?',
      category: 'question',
      status: 'active',
      businessType: 'restaurant',
      tags: ['delivery', 'inquiry'],
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13')
    }
  ]);

  // Mock automation rules for GMB
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Auto-thank positive reviews',
      trigger: {
        type: 'rating_threshold',
        conditions: {
          rating: 4,
          operator: 'greater_than'
        }
      },
      action: {
        type: 'auto_reply',
        template: 'Thank you for your wonderful review! We\'re so glad you had a great experience with us.',
        delay: 5
      },
      isActive: true,
      executionCount: 156,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'Flag negative reviews for owner review',
      trigger: {
        type: 'rating_threshold',
        conditions: {
          rating: 2,
          operator: 'less_than'
        }
      },
      action: {
        type: 'flag_for_review',
        delay: 0
      },
      isActive: true,
      executionCount: 23,
      createdAt: new Date('2024-01-08')
    },
    {
      id: '3',
      name: 'Auto-reply to delivery questions',
      trigger: {
        type: 'keyword_match',
        conditions: {
          keywords: ['delivery', 'deliver', 'takeout'],
          operator: 'contains'
        }
      },
      action: {
        type: 'auto_reply',
        template: 'Thank you for your inquiry! Yes, we offer delivery services. Please visit our website or call us for more details.',
        delay: 2
      },
      isActive: true,
      executionCount: 67,
      createdAt: new Date('2024-01-05')
    }
  ]);

  // Mock AI insights for GMB
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'review_trend',
      title: 'Review Volume Increasing',
      description: 'Your business is receiving 34% more reviews this month compared to last month.',
      impact: 'high',
      actionable: true,
      metrics: [
        { label: 'This Month', value: '67 reviews', change: '+34%' },
        { label: 'Avg Rating', value: '4.3', change: '+0.2' }
      ],
      recommendations: [
        'Continue current customer service strategies',
        'Consider implementing a review request system'
      ],
      createdAt: new Date('2024-01-20')
    },
    {
      id: '2',
      type: 'response_performance',
      title: 'Response Rate Improvement Needed',
      description: 'Your response rate to reviews has decreased. Quick responses improve customer satisfaction.',
      impact: 'medium',
      actionable: true,
      metrics: [
        { label: 'Response Rate', value: '67%', change: '-12%' },
        { label: 'Avg Response Time', value: '3.2 hours', change: '+45min' }
      ],
      recommendations: [
        'Enable more automation rules',
        'Set up notification alerts for new reviews'
      ],
      createdAt: new Date('2024-01-19')
    },
    {
      id: '3',
      type: 'keyword_insight',
      title: 'Common Praise Keywords',
      description: 'Customers frequently mention "friendly staff" and "quick service" in positive reviews.',
      impact: 'medium',
      actionable: false,
      metrics: [
        { label: 'Friendly Staff', value: '23 mentions' },
        { label: 'Quick Service', value: '18 mentions' }
      ],
      recommendations: [
        'Highlight these strengths in marketing materials',
        'Train staff to maintain these qualities'
      ],
      createdAt: new Date('2024-01-18')
    }
  ]);

  const [newTrainingData, setNewTrainingData] = useState({
    reviewText: '',
    rating: 5,
    expectedResponse: '',
    category: 'positive' as TrainingData['category'],
    businessType: '',
    tags: ''
  });

  const [newRule, setNewRule] = useState({
    name: '',
    triggerType: 'rating_threshold' as AutomationRule['trigger']['type'],
    rating: 5,
    keywords: '',
    actionType: 'auto_reply' as AutomationRule['action']['type'],
    template: '',
    delay: 5
  });

  const addTrainingData = () => {
    if (!newTrainingData.reviewText || !newTrainingData.expectedResponse) return;

    const trainingItem: TrainingData = {
      id: Date.now().toString(),
      reviewText: newTrainingData.reviewText,
      rating: newTrainingData.rating,
      expectedResponse: newTrainingData.expectedResponse,
      category: newTrainingData.category,
      status: 'active',
      businessType: newTrainingData.businessType,
      tags: newTrainingData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTrainingData([...trainingData, trainingItem]);
    setNewTrainingData({
      reviewText: '',
      rating: 5,
      expectedResponse: '',
      category: 'positive',
      businessType: '',
      tags: ''
    });
  };

  const addAutomationRule = () => {
    if (!newRule.name) return;

    const rule: AutomationRule = {
      id: Date.now().toString(),
      name: newRule.name,
      trigger: {
        type: newRule.triggerType,
        conditions: newRule.triggerType === 'rating_threshold' 
          ? { rating: newRule.rating, operator: 'greater_than' }
          : { keywords: newRule.keywords.split(',').map(k => k.trim()), operator: 'contains' }
      },
      action: {
        type: newRule.actionType,
        template: newRule.template,
        delay: newRule.delay
      },
      isActive: true,
      executionCount: 0,
      createdAt: new Date()
    };

    setAutomationRules([...automationRules, rule]);
    setNewRule({
      name: '',
      triggerType: 'rating_threshold',
      rating: 5,
      keywords: '',
      actionType: 'auto_reply',
      template: '',
      delay: 5
    });
  };

  const toggleTrainingStatus = (id: string) => {
    setTrainingData(trainingData.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
        : item
    ));
  };

  const toggleRuleStatus = (id: string) => {
    setAutomationRules(automationRules.map(rule => 
      rule.id === id 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    const icons = {
      'review_trend': 'fas fa-chart-line',
      'response_performance': 'fas fa-reply',
      'rating_analysis': 'fas fa-star',
      'keyword_insight': 'fas fa-key',
      'competitor_analysis': 'fas fa-users'
    };
    return icons[type];
  };

  const getInsightColor = (impact: AIInsight['impact']) => {
    const colors = {
      'high': 'border-red-200 bg-red-50',
      'medium': 'border-yellow-200 bg-yellow-50',
      'low': 'border-green-200 bg-green-50'
    };
    return colors[impact];
  };

  const getCategoryColor = (category: TrainingData['category']) => {
    const colors = {
      'positive': 'bg-green-100 text-green-800',
      'negative': 'bg-red-100 text-red-800',
      'neutral': 'bg-gray-100 text-gray-800',
      'question': 'bg-blue-100 text-blue-800',
      'complaint': 'bg-orange-100 text-orange-800'
    };
    return colors[category];
  };

  const tabs = [
    { name: 'Training Data', icon: 'fas fa-brain' },
    { name: 'Automation Rules', icon: 'fas fa-cogs' },
    { name: 'AI Insights', icon: 'fas fa-chart-bar' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GMB AI Agent</h1>
            <p className="text-gray-600 mt-1">Intelligent review management and automated responses for Google My Business</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i className="fas fa-circle text-green-400 mr-1"></i>
                AI Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-brain text-2xl text-purple-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Training Examples</p>
              <p className="text-2xl font-semibold text-gray-900">{trainingData.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-cogs text-2xl text-blue-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Rules</p>
              <p className="text-2xl font-semibold text-gray-900">{automationRules.filter(r => r.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-reply text-2xl text-green-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Auto Responses</p>
              <p className="text-2xl font-semibold text-gray-900">94.2%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-shield-alt text-2xl text-orange-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Reviews Flagged</p>
              <p className="text-2xl font-semibold text-gray-900">23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-gray-50 p-1">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-purple-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-purple-700 shadow'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-purple-600'
                  )
                }
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="p-6">
            {/* Training Data Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Review Response Training</h3>
                  <div className="text-sm text-gray-500">
                    Train the AI to respond appropriately to different types of reviews
                  </div>
                </div>

                {/* Add New Training Data Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Add Training Example</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Review Text
                        </label>
                        <textarea
                          value={newTrainingData.reviewText}
                          onChange={(e) => setNewTrainingData({...newTrainingData, reviewText: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter the customer review text..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                          </label>
                          <select
                            value={newTrainingData.rating}
                            onChange={(e) => setNewTrainingData({...newTrainingData, rating: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {[1, 2, 3, 4, 5].map(rating => (
                              <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={newTrainingData.category}
                            onChange={(e) => setNewTrainingData({...newTrainingData, category: e.target.value as TrainingData['category']})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                            <option value="question">Question</option>
                            <option value="complaint">Complaint</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newTrainingData.tags}
                          onChange={(e) => setNewTrainingData({...newTrainingData, tags: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="service, staff, quality"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected AI Response
                        </label>
                        <textarea
                          value={newTrainingData.expectedResponse}
                          onChange={(e) => setNewTrainingData({...newTrainingData, expectedResponse: e.target.value})}
                          rows={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter how the AI should respond to this type of review..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type (optional)
                        </label>
                        <input
                          type="text"
                          value={newTrainingData.businessType}
                          onChange={(e) => setNewTrainingData({...newTrainingData, businessType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="restaurant, service, retail, etc."
                        />
                      </div>
                      <button
                        onClick={addTrainingData}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add Training Example
                      </button>
                    </div>
                  </div>
                </div>

                {/* Training Data List */}
                <div className="space-y-4">
                  {trainingData.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {item.tags.map(tag => `#${tag}`).join(' ')}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleTrainingStatus(item.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Review Text:</h5>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{item.reviewText}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">AI Response:</h5>
                          <p className="text-gray-700 bg-purple-50 p-3 rounded-md">{item.expectedResponse}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tab.Panel>

            {/* Automation Rules Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Review Automation Rules</h3>
                  <div className="text-sm text-gray-500">
                    Create rules to automatically handle reviews based on ratings and content
                  </div>
                </div>

                {/* Add New Rule Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Create New Rule</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rule Name
                        </label>
                        <input
                          type="text"
                          value={newRule.name}
                          onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter rule name..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trigger Type
                        </label>
                        <select
                          value={newRule.triggerType}
                          onChange={(e) => setNewRule({...newRule, triggerType: e.target.value as AutomationRule['trigger']['type']})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="rating_threshold">Rating Threshold</option>
                          <option value="keyword_match">Keyword Match</option>
                          <option value="review_sentiment">Review Sentiment</option>
                        </select>
                      </div>
                      {newRule.triggerType === 'rating_threshold' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating Threshold
                          </label>
                          <select
                            value={newRule.rating}
                            onChange={(e) => setNewRule({...newRule, rating: Number(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {[1, 2, 3, 4, 5].map(rating => (
                              <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {newRule.triggerType === 'keyword_match' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keywords (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={newRule.keywords}
                            onChange={(e) => setNewRule({...newRule, keywords: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="delivery, price, service"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Action Type
                        </label>
                        <select
                          value={newRule.actionType}
                          onChange={(e) => setNewRule({...newRule, actionType: e.target.value as AutomationRule['action']['type']})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="auto_reply">Auto Reply</option>
                          <option value="flag_for_review">Flag for Review</option>
                          <option value="block_review">Block Review</option>
                          <option value="notify_owner">Notify Owner</option>
                          <option value="escalate">Escalate</option>
                        </select>
                      </div>
                      {(newRule.actionType === 'auto_reply') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Response Template
                          </label>
                          <textarea
                            value={newRule.template}
                            onChange={(e) => setNewRule({...newRule, template: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter the response template..."
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delay (minutes)
                        </label>
                        <input
                          type="number"
                          value={newRule.delay}
                          onChange={(e) => setNewRule({...newRule, delay: Number(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          min="0"
                          max="1440"
                        />
                      </div>
                      <button
                        onClick={addAutomationRule}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Create Rule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">
                            Triggered {rule.executionCount} times
                          </p>
                        </div>
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            rule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.isActive ? (
                            <>
                              <i className="fas fa-play mr-1"></i>
                              Active
                            </>
                          ) : (
                            <>
                              <i className="fas fa-pause mr-1"></i>
                              Paused
                            </>
                          )}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Trigger: </span>
                          <span className="text-gray-600">
                            {rule.trigger.type === 'rating_threshold' && 
                              `${rule.trigger.conditions.operator?.replace('_', ' ')} ${rule.trigger.conditions.rating} star${rule.trigger.conditions.rating !== 1 ? 's' : ''}`
                            }
                            {rule.trigger.type === 'keyword_match' && 
                              `Contains: ${rule.trigger.conditions.keywords?.join(', ')}`
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Action: </span>
                          <span className="text-gray-600">
                            {rule.action.type.replace('_', ' ')}
                            {rule.action.delay ? ` (${rule.action.delay}min delay)` : ''}
                          </span>
                        </div>
                      </div>
                      {rule.action.template && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-md">
                          <span className="font-medium text-gray-700">Template: </span>
                          <span className="text-gray-600">{rule.action.template}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Tab.Panel>

            {/* AI Insights Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                  <div className="text-sm text-gray-500">
                    AI-generated insights to improve your review management strategy
                  </div>
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Response Accuracy</p>
                        <p className="text-3xl font-bold">96.8%</p>
                        <p className="text-sm text-purple-100">+2.3% from last month</p>
                      </div>
                      <i className="fas fa-bullseye text-3xl text-purple-200"></i>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Auto-Response Rate</p>
                        <p className="text-3xl font-bold">89.2%</p>
                        <p className="text-sm text-green-100">+12% from last month</p>
                      </div>
                      <i className="fas fa-robot text-3xl text-green-200"></i>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Avg Response Time</p>
                        <p className="text-3xl font-bold">2.4min</p>
                        <p className="text-sm text-blue-100">-1.2min from last month</p>
                      </div>
                      <i className="fas fa-clock text-3xl text-blue-200"></i>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className={`rounded-lg border-2 p-6 ${getInsightColor(insight.impact)}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <i className={`${getInsightIcon(insight.type)} text-xl text-gray-600 mr-3`}></i>
                          <div>
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.impact} impact
                        </span>
                      </div>

                      {insight.metrics && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {insight.metrics.map((metric, index) => (
                            <div key={index} className="text-center p-3 bg-white rounded-md">
                              <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                              <p className="text-sm text-gray-600">{metric.label}</p>
                              {metric.change && (
                                <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                  {metric.change}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {insight.recommendations && insight.actionable && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Recommendations:</h5>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-0.5"></i>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center py-3 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      <i className="fas fa-download mr-2"></i>
                      Export Training Data
                    </button>
                    <button className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      <i className="fas fa-sync mr-2"></i>
                      Retrain Model
                    </button>
                    <button className="flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      <i className="fas fa-chart-line mr-2"></i>
                      View Full Analytics
                    </button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
