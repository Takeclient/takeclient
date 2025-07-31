'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BoltIcon,
  CheckIcon,
  SparklesIcon,
  FunnelIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { workflowTemplates } from '@/app/lib/workflow-templates';

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Templates', icon: '🎯' },
    { value: 'CRM', label: 'CRM', icon: '👥' },
    { value: 'Marketing', label: 'Marketing', icon: '📣' },
    { value: 'Sales', label: 'Sales', icon: '💰' },
    { value: 'Ecommerce', label: 'Ecommerce', icon: '🛒' },
  ];

  const filteredTemplates = useMemo(() => {
    let templates = workflowTemplates;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return templates;
  }, [selectedCategory, searchQuery]);

  const handleUseTemplate = (templateId: string) => {
    // Navigate to new workflow page with template preloaded
    router.push(`/dashboard/workflows/new?template=${templateId}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/dashboard/workflows"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BoltIcon className="h-7 w-7 text-purple-600 mr-3" />
                Workflow Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Start with pre-built workflows designed for your business
              </p>
            </div>
          </div>
          
          <Link
            href="/dashboard/workflows/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BoltIcon className="h-5 w-5 mr-2" />
            Build from Scratch
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
          >
            {/* Template Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{template.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {template.name}
                      {template.isPremium && (
                        <SparklesIcon className="h-4 w-4 text-yellow-500 ml-2" />
                      )}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        template.category === 'CRM'
                          ? 'bg-blue-100 text-blue-700'
                          : template.category === 'Marketing'
                          ? 'bg-green-100 text-green-700'
                          : template.category === 'Sales'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </div>

            {/* Template Details */}
            <div className="p-6 space-y-4">
              {/* Workflow Steps */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Workflow Steps
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <BoltIcon className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="font-medium">Trigger:</span>
                    <span className="ml-1">{template.triggerType.replace(/_/g, ' ').toLowerCase()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{template.actions.length} Actions</span>
                    <span className="text-gray-400 ml-1">configured</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {template.benefits && template.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Benefits
                  </h4>
                  <ul className="space-y-1">
                    {template.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                    {template.benefits.length > 2 && (
                      <li className="text-sm text-gray-400">
                        +{template.benefits.length - 2} more benefits
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 text-gray-400">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Estimated Time */}
              {template.estimatedTime && (
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>Runs in {template.estimatedTime}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BoltIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
} 