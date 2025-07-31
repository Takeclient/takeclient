'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  AcademicCapIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  useCase: string;
  personality: string;
  features: string[];
  sampleGreeting: string;
  trainingData: number;
  successRate: number;
  deployments: number;
  estimatedSetupTime: string;
  platforms: string[];
  thumbnail: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export default function AgentTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const templates: AgentTemplate[] = [
    {
      id: 'sales-assistant',
      name: 'Sales Assistant Pro',
      description: 'Intelligent sales agent that qualifies leads, handles objections, and books appointments',
      category: 'Sales',
      useCase: 'Lead Generation & Qualification',
      personality: 'Professional and persuasive',
      features: ['Lead Qualification', 'Objection Handling', 'Appointment Booking', 'Follow-up Sequences'],
      sampleGreeting: 'Hi! I\'m here to help you find the perfect solution for your business needs. What challenges are you looking to solve?',
      trainingData: 2500,
      successRate: 89.5,
      deployments: 1247,
      estimatedSetupTime: '5-10 minutes',
      platforms: ['website', 'landing-page', 'whatsapp'],
      thumbnail: '💼',
      isPopular: true,
    },
    {
      id: 'customer-support',
      name: 'Support Specialist',
      description: 'Comprehensive customer support agent for handling inquiries, troubleshooting, and escalations',
      category: 'Support',
      useCase: 'Customer Support',
      personality: 'Helpful and patient',
      features: ['FAQ Handling', 'Issue Troubleshooting', 'Ticket Creation', 'Live Agent Handoff'],
      sampleGreeting: 'Hello! I\'m your support assistant. I\'m here to help you with any questions or issues you might have.',
      trainingData: 3200,
      successRate: 92.3,
      deployments: 987,
      estimatedSetupTime: '3-7 minutes',
      platforms: ['website', 'whatsapp', 'facebook'],
      thumbnail: '🎧',
      isPopular: true,
    },
    {
      id: 'ecommerce-advisor',
      name: 'Shopping Assistant',
      description: 'E-commerce focused agent that helps customers find products and complete purchases',
      category: 'E-commerce',
      useCase: 'Product Recommendations',
      personality: 'Enthusiastic and knowledgeable',
      features: ['Product Search', 'Recommendations', 'Cart Assistance', 'Order Tracking'],
      sampleGreeting: 'Welcome to our store! I\'m here to help you find exactly what you\'re looking for. What can I help you with today?',
      trainingData: 1800,
      successRate: 87.1,
      deployments: 654,
      estimatedSetupTime: '7-12 minutes',
      platforms: ['website', 'landing-page'],
      thumbnail: '🛍️',
    },
    {
      id: 'appointment-booker',
      name: 'Appointment Scheduler',
      description: 'Specialized agent for booking appointments, managing calendars, and sending reminders',
      category: 'Scheduling',
      useCase: 'Appointment Booking',
      personality: 'Organized and efficient',
      features: ['Calendar Integration', 'Availability Checking', 'Booking Confirmation', 'Reminders'],
      sampleGreeting: 'Hi! I can help you book an appointment that works with your schedule. What service are you interested in?',
      trainingData: 1200,
      successRate: 94.7,
      deployments: 432,
      estimatedSetupTime: '8-15 minutes',
      platforms: ['website', 'whatsapp', 'telegram'],
      thumbnail: '📅',
      isNew: true,
    },
    {
      id: 'lead-qualifier',
      name: 'Lead Qualifier Max',
      description: 'Advanced lead qualification agent that scores and categorizes prospects',
      category: 'Sales',
      useCase: 'Lead Qualification',
      personality: 'Curious and engaging',
      features: ['Lead Scoring', 'BANT Qualification', 'CRM Integration', 'Handoff Triggers'],
      sampleGreeting: 'Thanks for your interest! I\'d love to learn more about your business to see how we can help. Mind if I ask a few questions?',
      trainingData: 2100,
      successRate: 91.2,
      deployments: 789,
      estimatedSetupTime: '6-10 minutes',
      platforms: ['website', 'landing-page', 'facebook'],
      thumbnail: '🎯',
    },
    {
      id: 'education-tutor',
      name: 'Learning Assistant',
      description: 'Educational agent that helps students with questions and provides learning guidance',
      category: 'Education',
      useCase: 'Educational Support',
      personality: 'Patient and encouraging',
      features: ['Q&A Support', 'Learning Paths', 'Progress Tracking', 'Resource Recommendations'],
      sampleGreeting: 'Hello, student! I\'m here to help you learn and succeed. What subject or topic would you like help with today?',
      trainingData: 2800,
      successRate: 88.9,
      deployments: 356,
      estimatedSetupTime: '10-15 minutes',
      platforms: ['website', 'slack'],
      thumbnail: '📚',
      isNew: true,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'Sales', name: 'Sales', count: templates.filter(t => t.category === 'Sales').length },
    { id: 'Support', name: 'Support', count: templates.filter(t => t.category === 'Support').length },
    { id: 'E-commerce', name: 'E-commerce', count: templates.filter(t => t.category === 'E-commerce').length },
    { id: 'Scheduling', name: 'Scheduling', count: templates.filter(t => t.category === 'Scheduling').length },
    { id: 'Education', name: 'Education', count: templates.filter(t => t.category === 'Education').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.useCase.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
      case 'telegram':
        return '✈️';
      case 'slack':
        return '💼';
      default:
        return '💻';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agent Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Get started quickly with pre-built agent templates for common use cases
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/ai-agents/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Custom Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
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
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Template Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{template.thumbnail}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {template.isPopular && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                      Popular
                    </span>
                  )}
                  {template.isNew && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      New
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <span className="ml-1 font-medium text-green-600">{template.successRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Deployments:</span>
                  <span className="ml-1 font-medium text-gray-900">{template.deployments.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Training Data:</span>
                  <span className="ml-1 font-medium text-gray-900">{template.trainingData.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Setup Time:</span>
                  <span className="ml-1 font-medium text-gray-900">{template.estimatedSetupTime}</span>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{template.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Platforms */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Compatible Platforms:</h4>
                <div className="flex space-x-2">
                  {template.platforms.map((platform) => (
                    <span key={platform} className="text-lg" title={platform}>
                      {getPlatformIcon(platform)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Greeting */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Greeting:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 italic">"{template.sampleGreeting}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button className="flex-1">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="outline">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Templates Found */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Custom Template CTA */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Need something custom?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create a completely custom AI agent tailored to your specific needs and industry.
          </p>
          <Link href="/dashboard/ai-agents/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Custom Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 