'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AutoPostingRule {
  id: string;
  name: string;
  platforms: string[];
  contentTemplate: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: string[]; // for weekly
    date?: number; // for monthly
  };
  isActive: boolean;
  lastPosted?: Date;
  nextPost: Date;
  contentSources?: string[];
  hashtags?: string[];
}

interface ContentTemplate {
  id: string;
  name: string;
  content: string;
  platforms: string[];
  variables: string[];
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'bg-black' },
  { id: 'snapchat', name: 'Snapchat', icon: 'fa-brands fa-snapchat', color: 'bg-yellow-400' },
];

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function AutoPostingPage() {
  const [rules, setRules] = useState<AutoPostingRule[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'templates'>('rules');

  const [newRule, setNewRule] = useState({
    name: '',
    platforms: [] as string[],
    contentTemplate: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '',
    days: [] as string[],
    date: 1,
    contentSources: [] as string[],
    hashtags: [] as string[]
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    platforms: [] as string[],
    variables: [] as string[]
  });

  useEffect(() => {
    fetchAutoPostingData();
  }, []);

  const fetchAutoPostingData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockRules: AutoPostingRule[] = [
        {
          id: '1',
          name: 'Daily Motivation Posts',
          platforms: ['instagram', 'facebook'],
          contentTemplate: 'Start your day with positive energy! {motivation_quote} #motivation #success',
          schedule: {
            frequency: 'daily',
            time: '09:00'
          },
          isActive: true,
          lastPosted: new Date('2024-01-15T09:00:00'),
          nextPost: new Date('2024-01-16T09:00:00'),
          contentSources: ['motivation_quotes'],
          hashtags: ['#motivation', '#success', '#dailyquote']
        },
        {
          id: '2',
          name: 'Weekly Product Features',
          platforms: ['instagram', 'twitter'],
          contentTemplate: 'Feature Friday: Check out {product_name} - {product_description} #ProductSpotlight',
          schedule: {
            frequency: 'weekly',
            time: '15:00',
            days: ['Friday']
          },
          isActive: true,
          lastPosted: new Date('2024-01-12T15:00:00'),
          nextPost: new Date('2024-01-19T15:00:00'),
          contentSources: ['product_catalog'],
          hashtags: ['#ProductSpotlight', '#FeatureFriday']
        },
        {
          id: '3',
          name: 'Monthly Newsletter',
          platforms: ['facebook', 'twitter'],
          contentTemplate: 'Monthly roundup: {month_highlights} Subscribe to our newsletter for more updates!',
          schedule: {
            frequency: 'monthly',
            time: '12:00',
            date: 1
          },
          isActive: false,
          nextPost: new Date('2024-02-01T12:00:00'),
          contentSources: ['newsletter_content'],
          hashtags: ['#Newsletter', '#MonthlyUpdate']
        }
      ];

      const mockTemplates: ContentTemplate[] = [
        {
          id: '1',
          name: 'Product Launch Template',
          content: '🚀 Exciting news! We\'re launching {product_name}! {product_description} Get yours today at {website_url} #NewProduct #Launch',
          platforms: ['instagram', 'facebook', 'twitter'],
          variables: ['product_name', 'product_description', 'website_url']
        },
        {
          id: '2',
          name: 'Event Promotion',
          content: '📅 Don\'t miss {event_name} on {event_date}! {event_description} Register now: {registration_url} #Event',
          platforms: ['facebook', 'twitter'],
          variables: ['event_name', 'event_date', 'event_description', 'registration_url']
        },
        {
          id: '3',
          name: 'Customer Testimonial',
          content: '⭐ "{testimonial_text}" - {customer_name}. Thank you for your amazing feedback! #CustomerLove #Testimonial',
          platforms: ['instagram', 'facebook'],
          variables: ['testimonial_text', 'customer_name']
        }
      ];

      setRules(mockRules);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching auto-posting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!newRule.name || !newRule.contentTemplate || newRule.platforms.length === 0 || !newRule.time) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const rule: AutoPostingRule = {
        id: Date.now().toString(),
        name: newRule.name,
        platforms: newRule.platforms,
        contentTemplate: newRule.contentTemplate,
        schedule: {
          frequency: newRule.frequency,
          time: newRule.time,
          ...(newRule.frequency === 'weekly' && { days: newRule.days }),
          ...(newRule.frequency === 'monthly' && { date: newRule.date })
        },
        isActive: true,
        nextPost: calculateNextPost(newRule),
        contentSources: newRule.contentSources,
        hashtags: newRule.hashtags
      };

      setRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        platforms: [],
        contentTemplate: '',
        frequency: 'daily',
        time: '',
        days: [],
        date: 1,
        contentSources: [],
        hashtags: []
      });
      setShowCreateRuleModal(false);
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content || newTemplate.platforms.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const template: ContentTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name,
        content: newTemplate.content,
        platforms: newTemplate.platforms,
        variables: extractVariables(newTemplate.content)
      };

      setTemplates(prev => [...prev, template]);
      setNewTemplate({
        name: '',
        content: '',
        platforms: [],
        variables: []
      });
      setShowCreateTemplateModal(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const calculateNextPost = (rule: any) => {
    const now = new Date();
    const [hours, minutes] = rule.time.split(':').map(Number);
    
    switch (rule.frequency) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow;
        
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(hours, minutes, 0, 0);
        return nextWeek;
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(rule.date);
        nextMonth.setHours(hours, minutes, 0, 0);
        return nextMonth;
        
      default:
        return new Date();
    }
  };

  const extractVariables = (content: string) => {
    const matches = content.match(/{([^}]+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.color || 'bg-gray-500';
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.icon || 'fa-share-alt';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/social-media"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
            >
              ← Back to Social Media
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Auto Posting</h1>
            <p className="text-gray-600 mt-1">Automate your social media posts with smart scheduling</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-alt mr-2"></i>
              New Template
            </button>
            <button
              onClick={() => setShowCreateRuleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-robot mr-2"></i>
              New Rule
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Automation Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content Templates ({templates.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rules' ? (
            <div className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-robot text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No automation rules created yet.</p>
                  <button
                    onClick={() => setShowCreateRuleModal(true)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Your First Rule
                  </button>
                </div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{rule.contentTemplate}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Platforms:</span>
                            <div className="flex space-x-2 mt-1">
                              {rule.platforms.map(platformId => (
                                <span
                                  key={platformId}
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs text-white ${
                                    getPlatformColor(platformId)
                                  }`}
                                >
                                  <i className={`${getPlatformIcon(platformId)} mr-1`}></i>
                                  {platforms.find(p => p.id === platformId)?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">Schedule:</span>
                            <p className="text-sm text-gray-700 mt-1">
                              {rule.schedule.frequency.charAt(0).toUpperCase() + rule.schedule.frequency.slice(1)} at {rule.schedule.time}
                              {rule.schedule.days && ` on ${rule.schedule.days.join(', ')}`}
                              {rule.schedule.date && ` on the ${rule.schedule.date}${
                                rule.schedule.date === 1 ? 'st' : 
                                rule.schedule.date === 2 ? 'nd' : 
                                rule.schedule.date === 3 ? 'rd' : 'th'
                              }`}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">Next Post:</span>
                            <p className="text-sm text-gray-700 mt-1">
                              {rule.nextPost.toLocaleDateString()} at {rule.nextPost.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        {rule.hashtags && rule.hashtags.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-500">Hashtags:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {rule.hashtags.map((hashtag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`px-3 py-1 text-sm rounded ${
                            rule.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {rule.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No content templates created yet.</p>
                  <button
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Create Your First Template
                  </button>
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{template.name}</h3>
                        <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded border">{template.content}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Platforms:</span>
                            <div className="flex space-x-2 mt-1">
                              {template.platforms.map(platformId => (
                                <span
                                  key={platformId}
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs text-white ${
                                    getPlatformColor(platformId)
                                  }`}
                                >
                                  <i className={`${getPlatformIcon(platformId)} mr-1`}></i>
                                  {platforms.find(p => p.id === platformId)?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-500">Variables:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {template.variables.map((variable, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {'{' + variable + '}'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Rule Modal */}
      {showCreateRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Automation Rule</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Daily Motivation Posts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => (
                    <label key={platform.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRule.platforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewRule(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }));
                          } else {
                            setNewRule(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }));
                          }
                        }}
                        className="mr-2"
                      />
                      <i className={`${platform.icon} mr-2`}></i>
                      {platform.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Template</label>
                <textarea
                  value={newRule.contentTemplate}
                  onChange={(e) => setNewRule(prev => ({ ...prev, contentTemplate: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Use {variables} for dynamic content. e.g., Check out {product_name}! #product"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newRule.frequency}
                    onChange={(e) => setNewRule(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newRule.time}
                    onChange={(e) => setNewRule(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {newRule.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                  <div className="grid grid-cols-2 gap-3">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newRule.days.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRule(prev => ({ ...prev, days: [...prev.days, day] }));
                            } else {
                              setNewRule(prev => ({ ...prev, days: prev.days.filter(d => d !== day) }));
                            }
                          }}
                          className="mr-2"
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {newRule.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newRule.date}
                    onChange={(e) => setNewRule(prev => ({ ...prev, date: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowCreateRuleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Content Template</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Product Launch Template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Use {variables} for dynamic content. e.g., Introducing {product_name}! {description} #newproduct"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => (
                    <label key={platform.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTemplate.platforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTemplate(prev => ({ ...prev, platforms: [...prev.platforms, platform.id] }));
                          } else {
                            setNewTemplate(prev => ({ ...prev, platforms: prev.platforms.filter(p => p !== platform.id) }));
                          }
                        }}
                        className="mr-2"
                      />
                      <i className={`${platform.icon} mr-2`}></i>
                      {platform.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setShowCreateTemplateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 