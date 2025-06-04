'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  SparklesIcon,
  EyeIcon,
  DocumentPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import CreatePageModal from '../components/CreatePageModal';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  industry: string;
  thumbnail?: string;
  tags: string[];
  isPremium: boolean;
  isActive: boolean;
  content: any[];
}

interface TemplateCategory {
  id: string;
  name: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (showPremiumOnly) params.append('premium', 'true');

      const response = await fetch(`/api/landing-page-templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        setCategories(data.categories || []);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchTerm, showPremiumOnly]);

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleUseTemplate = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowCreateModal(true);
  };

  const handleCreatePage = async (data: { name: string; slug: string; domain?: string; templateId?: string }) => {
    try {
      // First, get the template content
      const templateId = data.templateId || selectedTemplateId;
      let templateContent = [];

      if (templateId) {
        const templateResponse = await fetch('/api/landing-page-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId }),
        });

        if (templateResponse.ok) {
          const templateData = await templateResponse.json();
          templateContent = templateData.template.content || [];
        }
      }

      // Create the landing page with template content
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          customDomain: data.domain,
          templateId: templateId,
          content: templateContent, // Use template content instead of empty array
          status: 'DRAFT',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Landing page created successfully');
        setShowCreateModal(false);
        router.push(`/dashboard/landing-pages/${result.page.id}/edit`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create landing page');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create landing page');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedTemplateId(undefined);
  };

  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: any } = {
      'Technology': SparklesIcon,
      'Retail': BuildingOfficeIcon,
      'Healthcare': BuildingOfficeIcon,
      'Real Estate': BuildingOfficeIcon,
      'Food & Beverage': BuildingOfficeIcon,
      'Health & Fitness': BuildingOfficeIcon,
      'Professional Services': BuildingOfficeIcon,
      'Education': BuildingOfficeIcon,
    };
    return icons[industry] || BuildingOfficeIcon;
  };

  // Group templates by industry for better organization
  const templatesByIndustry = templates.reduce((acc, template) => {
    if (!acc[template.industry]) {
      acc[template.industry] = [];
    }
    acc[template.industry].push(template);
    return acc;
  }, {} as { [industry: string]: Template[] });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/dashboard/landing-pages"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Landing Pages
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Industry Templates</h1>
              <p className="text-gray-600">Professional templates designed for specific industries</p>
            </div>
          </div>
          
          <Link href="/dashboard/landing-pages/new">
            <Button variant="secondary" className="shadow-sm">
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Start from Scratch
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-8 bg-white p-6 shadow-sm rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Templates
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Search by name, industry, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Industry Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="category"
                name="category"
                className="block w-full pl-10 pr-3 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition-colors"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Premium Filter */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center h-12">
              <input
                id="premium"
                name="premium"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
              />
              <label htmlFor="premium" className="ml-3 block text-sm font-medium text-gray-700">
                Show premium templates only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Display */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <SparklesIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-8">
              Try adjusting your search or filters to find the perfect template.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setShowPremiumOnly(false);
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(templatesByIndustry).map(([industry, industryTemplates]) => {
              const IndustryIcon = getIndustryIcon(industry);
              
              return (
                <div key={industry}>
                  <div className="flex items-center mb-6">
                    <IndustryIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">{industry}</h2>
                    <span className="ml-3 text-sm text-gray-500">
                      {industryTemplates.length} template{industryTemplates.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {industryTemplates.map((template) => (
                      <div key={template.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 group">
                        {/* Template Preview */}
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                          {template.thumbnail ? (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <SparklesIcon className="h-16 w-16 text-blue-400 mx-auto mb-2 opacity-60" />
                                <span className="text-sm text-gray-500">{template.category}</span>
                              </div>
                            </div>
                          )}
                          
                          {template.isPremium && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              Premium
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="space-y-2">
                              <button
                                className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform shadow-lg"
                                onClick={() => handlePreviewTemplate(template)}
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span className="font-medium">Preview</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Template Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              {template.name}
                            </h3>
                          </div>
                          
                          {template.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{template.tags.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                              <span>{template.industry}</span>
                            </div>
                            
                            <Button
                              onClick={() => handleUseTemplate(template.id)}
                              className="text-sm shadow-sm"
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onConfirm={handleCreatePage}
        templateId={selectedTemplateId}
      />

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {previewTemplate.thumbnail ? (
                    <img
                      src={previewTemplate.thumbnail}
                      alt={previewTemplate.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <SparklesIcon className="h-24 w-24 text-blue-400 mx-auto mb-4 opacity-60" />
                      <p className="text-gray-500 text-lg">Template Preview</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {previewTemplate.content.length} sections included
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Template Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Industry:</span>
                    <p className="text-gray-900">{previewTemplate.industry}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sections:</span>
                    <p className="text-gray-900">{previewTemplate.content.length} components</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500">Includes:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewTemplate.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleUseTemplate(previewTemplate.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <DocumentPlusIcon className="-ml-1 mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 