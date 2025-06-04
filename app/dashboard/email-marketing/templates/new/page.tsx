'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

const TEMPLATE_CATEGORIES = [
  'NEWSLETTER',
  'PROMOTIONAL',
  'TRANSACTIONAL',
  'WELCOME',
  'FOLLOW_UP',
  'ANNOUNCEMENT',
  'SURVEY',
  'OTHER',
];

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'OTHER',
    isActive: true,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }
    
    if (!formData.subject) {
      toast.error('Subject line is required');
      return;
    }
    
    if (!formData.content) {
      toast.error('Template content is required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/email-marketing/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Template created successfully');
        router.push(`/dashboard/email-marketing/templates/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      
      setFormData({ ...formData, content: newText });
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const commonVariables = [
    'firstName',
    'lastName',
    'email',
    'companyName',
    'unsubscribeUrl',
    'webViewUrl',
    'currentDate',
    'currentYear',
  ];

  const sampleTemplates = {
    NEWSLETTER: {
      subject: 'Monthly Newsletter - {{currentDate}}',
      content: `<h1>Hello {{firstName}}!</h1>
<p>Welcome to our monthly newsletter. Here's what's new this month:</p>

<h2>Latest Updates</h2>
<p>We've been working hard to bring you new features and improvements...</p>

<h2>Featured Article</h2>
<p>This month we're highlighting...</p>

<p>Best regards,<br>
The {{companyName}} Team</p>

<p><small><a href="{{webViewUrl}}">View in browser</a> | <a href="{{unsubscribeUrl}}">Unsubscribe</a></small></p>`
    },
    PROMOTIONAL: {
      subject: 'Special Offer Just for You, {{firstName}}!',
      content: `<h1>Exclusive Offer for {{firstName}}</h1>
<p>We have a special promotion just for you!</p>

<h2>🎉 50% OFF Everything!</h2>
<p>Use code: SAVE50 at checkout</p>

<p><a href="#" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Shop Now</a></p>

<p>This offer expires soon, so don't wait!</p>

<p>Happy shopping,<br>
The {{companyName}} Team</p>

<p><small><a href="{{unsubscribeUrl}}">Unsubscribe</a></small></p>`
    },
    WELCOME: {
      subject: 'Welcome to {{companyName}}, {{firstName}}!',
      content: `<h1>Welcome {{firstName}}!</h1>
<p>Thank you for joining {{companyName}}. We're excited to have you on board!</p>

<h2>Getting Started</h2>
<p>Here are a few things you can do to get the most out of your experience:</p>
<ul>
  <li>Complete your profile</li>
  <li>Explore our features</li>
  <li>Join our community</li>
</ul>

<p>If you have any questions, don't hesitate to reach out to our support team.</p>

<p>Welcome aboard!<br>
The {{companyName}} Team</p>

<p><small><a href="{{unsubscribeUrl}}">Unsubscribe</a></small></p>`
    }
  };

  const loadSampleTemplate = (category: string) => {
    const sample = sampleTemplates[category as keyof typeof sampleTemplates];
    if (sample) {
      setFormData({
        ...formData,
        subject: sample.subject,
        content: sample.content,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/email-marketing/templates"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Templates
        </Link>
        
        <div className="flex items-center">
          <DocumentDuplicateIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Email Template</h1>
            <p className="text-sm text-gray-500">Create a reusable email template</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Template Details */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Template Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Monthly Newsletter Template"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TEMPLATE_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this template"
                />
              </div>
              
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">Active template (available for use in campaigns)</span>
                </label>
              </div>
            </div>

            {/* Email Content */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Email Content</h2>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              </div>
              
              {/* Sample Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Start (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(sampleTemplates).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => loadSampleTemplate(category)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Load {category.toLowerCase().replace('_', ' ')} template
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email subject line"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content *
                  </label>
                  <textarea
                    id="content"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={16}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your email content (HTML supported)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can use HTML tags for formatting. Use variables like {'{'}firstName{'}'} for personalization.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/email-marketing/templates">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
              
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Variables</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click to insert variables into your template:
            </p>
            <div className="space-y-2">
              {commonVariables.map(variable => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
                >
                  {'{'}{'{'}{variable}{'}'}{'}'} 
                  <span className="text-gray-500 ml-2">
                    {variable === 'firstName' && '(First name)'}
                    {variable === 'lastName' && '(Last name)'}
                    {variable === 'email' && '(Email address)'}
                    {variable === 'companyName' && '(Company name)'}
                    {variable === 'unsubscribeUrl' && '(Unsubscribe link)'}
                    {variable === 'webViewUrl' && '(Web view link)'}
                    {variable === 'currentDate' && '(Current date)'}
                    {variable === 'currentYear' && '(Current year)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-md p-4">
                <div className="mb-4">
                  <strong>Subject:</strong> {formData.subject || 'No subject'}
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content || '<p>No content</p>' 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Variables will be replaced with actual values when sent.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Use descriptive names for easy identification</li>
              <li>• Include personalization variables for better engagement</li>
              <li>• Test your HTML in the preview before saving</li>
              <li>• Always include an unsubscribe link</li>
              <li>• Keep mobile users in mind with responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 