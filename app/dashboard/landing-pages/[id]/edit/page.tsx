'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DocumentArrowUpIcon,
  CheckIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  SparklesIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import { componentCategories, getComponentById, type PageComponent } from '@/app/lib/landing-page-components';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageSection {
  id: string;
  componentId: string;
  props: any;
}

interface LandingPage {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  content: PageSection[];
  css?: string;
  javascript?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customDomain?: string;
  publishedAt?: string;
}

const ICON_MAP: { [key: string]: any } = {
  Bars3Icon,
  SparklesIcon,
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
};

// Sortable Section Component
function SortableSection({ section, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  section: PageSection;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const component = getComponentById(section.componentId);
  if (!component) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-200 ${
        isDragging 
          ? 'z-50 shadow-2xl ring-2 ring-blue-500 ring-opacity-50' 
          : 'hover:shadow-lg hover:ring-2 hover:ring-blue-400 hover:ring-opacity-30'
      }`}
    >
      {/* Enhanced Control Overlay */}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center space-x-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Edit Component"
          >
            <CogIcon className="h-4 w-4 text-gray-600" />
          </button>
          
          <div className="h-4 w-px bg-gray-300"></div>
          
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Move Up"
          >
            <ChevronUpIcon className="h-4 w-4 text-gray-600" />
          </button>
          
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Move Down"
          >
            <ChevronDownIcon className="h-4 w-4 text-gray-600" />
          </button>
          
          <div className="h-4 w-px bg-gray-300"></div>
          
          <div
            {...attributes}
            {...listeners}
            className="p-2 rounded-md hover:bg-gray-50 cursor-move transition-colors"
            title="Drag to reorder"
          >
            <Bars3Icon className="h-4 w-4 text-gray-600" />
          </div>
          
          <div className="h-4 w-px bg-gray-300"></div>
          
          <button
            onClick={onDelete}
            className="p-2 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete Component"
          >
            <TrashIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Component Name Indicator */}
      <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
          {component.name}
        </div>
      </div>
      
      {/* Component Content */}
      <div className={`pointer-events-none ${isDragging ? 'opacity-60' : ''}`}>
        <div dangerouslySetInnerHTML={{ __html: renderComponent(component, section.props) }} />
      </div>
      
      {/* Drag Indicator Border */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
        isDragging 
          ? 'ring-2 ring-blue-500 ring-opacity-60 bg-blue-50 bg-opacity-20' 
          : 'group-hover:ring-1 group-hover:ring-blue-400 group-hover:ring-opacity-40'
      }`}></div>
    </div>
  );
}

// Helper function to render component with props
function renderComponent(component: PageComponent, props: any): string {
  let html = component.template;
  
  try {
    // Handle conditional blocks first ({{#if condition}}...{{/if}})
    const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    html = html.replace(ifRegex, (match, condition, content) => {
      const value = props[condition];
      if (value && value !== '' && value !== null && value !== undefined) {
        return content;
      }
      return '';
    });
    
    // Handle array iterations ({{#each array}}...{{/each}})
    Object.keys(props).forEach(key => {
      const value = props[key];
      
      if (Array.isArray(value)) {
        const regex = new RegExp(`\\{\\{#each ${key}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`, 'g');
        html = html.replace(regex, (match, content) => {
          return value.map((item: any) => {
            let itemHtml = content;
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(itemKey => {
                const itemValue = item[itemKey];
                // Escape potential URL issues
                const safeValue = typeof itemValue === 'string' ? 
                  itemValue.replace(/[{}]/g, '') : itemValue;
                itemHtml = itemHtml.replace(new RegExp(`\\{\\{this\\.${itemKey}\\}\\}`, 'g'), safeValue || '');
              });
            }
            return itemHtml;
          }).join('');
        });
      }
    });
    
    // Handle simple variable replacements
    Object.keys(props).forEach(key => {
      const value = props[key];
      if (!Array.isArray(value) && typeof value !== 'object') {
        // Escape curly braces in values to prevent template parsing issues
        const safeValue = typeof value === 'string' ? 
          value.replace(/[{}]/g, '') : (value || '');
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safeValue);
      }
    });
    
    // Clean up any remaining template variables to prevent URL issues
    html = html.replace(/\{\{[^}]*\}\}/g, '');
    
    // Fix any malformed URLs by removing empty src attributes
    html = html.replace(/src=["'](\s*|undefined|null)["']/g, 'src="#"');
    html = html.replace(/href=["'](\s*|undefined|null)["']/g, 'href="#"');
    
    return html;
  } catch (error) {
    console.error('Error rendering component template:', error);
    return `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error rendering component: ${component.name}
    </div>`;
  }
}

export default function EditLandingPagePage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const previewRef = useRef<HTMLIFrameElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [page, setPage] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/landing-pages/${pageId}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data.page);
        setSections(data.page.content || []);
      } else {
        toast.error('Failed to load landing page');
        router.push('/dashboard/landing-pages');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load landing page');
    } finally {
      setIsLoading(false);
    }
  }, [pageId, router]);

  useEffect(() => {
    if (pageId === 'new') {
      // Create new page
      setPage({
        id: 'new',
        name: 'Untitled Page',
        slug: 'untitled-page',
        status: 'DRAFT',
        content: [],
      });
      setSections([]);
      setIsLoading(false);
    } else {
      fetchPage();
    }
  }, [pageId, fetchPage]);

  const handleSave = async () => {
    if (!page) return;
    
    try {
      setIsSaving(true);
      
      const pageData = {
        ...page,
        content: sections,
      };
      
      const response = await fetch(
        pageId === 'new' ? '/api/landing-pages' : `/api/landing-pages/${pageId}`,
        {
          method: pageId === 'new' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        toast.success('Landing page saved successfully');
        
        // Update the page state with the returned data
        setPage(data.page);
        setSections(data.page.content || []);
        
        if (pageId === 'new') {
          router.push(`/dashboard/landing-pages/${data.page.id}/edit`);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save error:', errorData);
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        
        if (errorData.details) {
          // Handle Zod validation errors
          const validationErrors = errorData.details.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
          toast.error(`Validation error: ${validationErrors}`);
        } else {
          toast.error(errorData.error || `Failed to save landing page (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save landing page - network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page) return;
    
    try {
      setIsSaving(true);
      
      // First save the current content
      const pageData = {
        ...page,
        content: sections,
      };
      
      const saveResponse = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save content before publishing');
      }
      
      // Then publish the page
      const publishResponse = await fetch(`/api/landing-pages/${pageId}/publish`, {
        method: 'POST',
      });

      if (publishResponse.ok) {
        const publishData = await publishResponse.json();
        toast.success('Landing page published successfully');
        setPage({ ...page, status: 'PUBLISHED', publishedAt: new Date().toISOString() });
      } else {
        const errorData = await publishResponse.json();
        toast.error(errorData.error || 'Failed to publish landing page');
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      toast.error('Failed to publish landing page');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!page || pageId === 'new' || sections.length === 0) return;
    
    try {
      const pageData = {
        ...page,
        content: sections,
      };
      
      await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [page, pageId, sections]);

  // Auto-save every 30 seconds when there are changes
  useEffect(() => {
    if (sections.length === 0) return;
    
    const autoSaveInterval = setInterval(autoSave, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [autoSave, sections]);

  const generateSectionId = () => {
    return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddSection = (component: PageComponent) => {
    const newSection: PageSection = {
      id: generateSectionId(),
      componentId: component.id,
      props: { ...component.defaultProps },
    };
    
    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection);
    setShowComponentLibrary(false);
  };

  const handleUpdateSection = (sectionId: string, props: any) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, props } : section
    ));
    debouncedUpdatePreview();
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (isDragging) return; // Prevent moves during drag operations
    
    setSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;
      
      const newSections = [...prev];
      if (direction === 'up' && index > 0) {
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      
      return newSections;
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    
    if (!over || active.id === over.id) {
      return;
    }

    try {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }
        
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        
        return newItems;
      });
    } catch (error) {
      console.error('Error during drag operation:', error);
      toast.error('Failed to reorder sections');
    }
  };

  const updatePreview = useCallback(() => {
    if (previewRef.current && !isDragging) {
      try {
        const previewDocument = previewRef.current.contentDocument;
        if (previewDocument) {
          const html = sections.map(section => {
            const component = getComponentById(section.componentId);
            return component ? renderComponent(component, section.props) : '';
          }).join('');
          
          previewDocument.open();
          previewDocument.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>${page?.css || ''}</style>
              </head>
              <body>
                ${html}
                <script>${page?.javascript || ''}</script>
              </body>
            </html>
          `);
          previewDocument.close();
        }
      } catch (error) {
        console.error('Error updating preview:', error);
      }
    }
  }, [sections, page?.css, page?.javascript, isDragging]);

  const debouncedUpdatePreview = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(updatePreview, 300);
  }, [updatePreview]);

  useEffect(() => {
    debouncedUpdatePreview();
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [debouncedUpdatePreview]);

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Improved Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/landing-pages"
                className="inline-flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={page?.name || ''}
                    onChange={(e) => setPage(page ? { ...page, name: e.target.value } : null)}
                    className="text-lg font-semibold bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 px-2 py-1 rounded-md transition-all"
                    placeholder="Page Name"
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>/{page?.slug || ''}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      page?.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page?.status || 'DRAFT'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Preview Mode Switcher - Improved */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    previewMode === 'desktop' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Desktop View"
                >
                  <ComputerDesktopIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    previewMode === 'tablet' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Tablet View"
                >
                  <DevicePhoneMobileIcon className="h-4 w-4 rotate-90" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    previewMode === 'mobile' 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Mobile View"
                >
                  <DevicePhoneMobileIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <div className="h-8 w-px bg-gray-300" />
              
              {/* Action Buttons - Improved */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowSettings(!showSettings)}
                  className="shadow-sm"
                >
                  <CogIcon className="-ml-1 mr-2 h-4 w-4" />
                  Settings
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                
                {page?.status === 'DRAFT' ? (
                  <Button 
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="shadow-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <DocumentArrowUpIcon className="-ml-1 mr-2 h-4 w-4" />
                    Publish
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="shadow-sm bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckIcon className="-ml-1 mr-2 h-4 w-4" />
                    Published
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`flex-1 flex ${isFullscreen ? 'fixed inset-0 z-50 pt-20' : ''}`}>
        {/* Improved Component Library Sidebar */}
        <div className={`w-80 bg-white border-r border-gray-200 shadow-lg overflow-hidden ${showComponentLibrary ? '' : 'hidden'}`}>
          <div className="flex flex-col h-full">
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Component Library</h3>
                <button
                  onClick={() => setShowComponentLibrary(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Drag and drop components to build your page</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {componentCategories.map(category => {
                  const IconComponent = ICON_MAP[category.icon];
                  
                  return (
                    <div key={category.id}>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        {IconComponent && <IconComponent className="h-4 w-4 mr-2 text-blue-600" />}
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {category.components.map(component => {
                          const ComponentIcon = ICON_MAP[component.icon];
                          
                          return (
                            <button
                              key={component.id}
                              onClick={() => handleAddSection(component)}
                              className="group relative text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                {ComponentIcon && (
                                  <div className="flex-shrink-0">
                                    <ComponentIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                                    {component.name}
                                  </span>
                                </div>
                              </div>
                              {/* Hover effect */}
                              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-400 pointer-events-none"></div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Improved Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Enhanced Canvas */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full flex items-start justify-center p-6">
              <div
                className={`bg-white shadow-lg transition-all duration-300 ${
                  previewMode === 'mobile' ? 'rounded-lg' : 'rounded-xl'
                }`}
                style={{ 
                  width: previewWidths[previewMode],
                  minHeight: '600px'
                }}
              >
                {sections.length === 0 ? (
                  <div className="py-32 px-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                    <DocumentDuplicateIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Start Building Your Page</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Add components from the library to create your landing page. You can drag and drop, reorder, and customize each section.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setShowComponentLibrary(true)}
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Your First Component
                      </Button>
                      <div className="text-sm text-gray-400">
                        or browse templates to get started quickly
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {sections.map((section, index) => (
                          <SortableSection
                            key={section.id}
                            section={section}
                            onEdit={() => setSelectedSection(section)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onMoveUp={() => handleMoveSection(section.id, 'up')}
                            onMoveDown={() => handleMoveSection(section.id, 'down')}
                            isFirst={index === 0}
                            isLast={index === sections.length - 1}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    
                    {/* Add Component Button at Bottom */}
                    <div className="p-6 text-center border-t-2 border-dashed border-gray-300 bg-gray-50 rounded-b-xl">
                      <Button
                        variant="secondary"
                        onClick={() => setShowComponentLibrary(true)}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add Component
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Floating Toolbar for Easy Access */}
          {!showComponentLibrary && sections.length > 0 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowComponentLibrary(true)}
                    className="rounded-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <CogIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Right Sidebar */}
        {(showSettings || selectedSection) && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-lg">
            {selectedSection ? (
              <ComponentSettings
                section={selectedSection}
                onUpdate={(props) => handleUpdateSection(selectedSection.id, props)}
                onClose={() => setSelectedSection(null)}
              />
            ) : (
              <PageSettings
                page={page}
                onUpdate={(updates) => setPage(page ? { ...page, ...updates } : null)}
                onClose={() => setShowSettings(false)}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Saving...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component Settings Panel
function ComponentSettings({ section, onUpdate, onClose }: {
  section: PageSection;
  onUpdate: (props: any) => void;
  onClose: () => void;
}) {
  const [props, setProps] = useState(section.props);
  const [availableForms, setAvailableForms] = useState<Array<{ id: string; title: string }>>([]);
  
  const component = getComponentById(section.componentId);
  
  useEffect(() => {
    // Fetch available forms if this component has a form field
    if (component && Object.values(component.schema).some(field => field.type === 'form')) {
      fetchForms();
    }
  }, [component]);
  
  if (!component) return null;
  
  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setAvailableForms(data.forms || []);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };
  
  const handleChange = (key: string, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onUpdate(newProps);
  };
  
  const handleArrayItemChange = (key: string, index: number, field: string, value: any) => {
    const array = [...(props[key] || [])];
    array[index] = { ...array[index], [field]: value };
    handleChange(key, array);
  };
  
  const handleAddArrayItem = (key: string) => {
    const schema = component.schema[key];
    const defaultItem = schema.default?.[0] || {};
    const array = [...(props[key] || []), { ...defaultItem }];
    handleChange(key, array);
  };
  
  const handleRemoveArrayItem = (key: string, index: number) => {
    const array = [...(props[key] || [])];
    array.splice(index, 1);
    handleChange(key, array);
  };
  
  return (
    <div>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{component.name} Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {Object.entries(component.schema).map(([key, field]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.placeholder}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.placeholder}
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {field.type === 'color' && (
              <input
                type="color"
                value={props[key] || '#000000'}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            )}
            
            {field.type === 'boolean' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={props[key] || false}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-700">Enable</span>
              </label>
            )}
            
            {field.type === 'select' && (
              <select
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'form' && (
              <select
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a form</option>
                {availableForms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'image' && (
              <input
                type="url"
                value={props[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL"
              />
            )}
            
            {field.type === 'array' && (
              <div className="space-y-2">
                {(props[key] || []).map((item: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md">
                    {typeof item === 'object' ? (
                      <div className="space-y-2">
                        {Object.keys(item).map(itemKey => (
                          <input
                            key={itemKey}
                            type="text"
                            value={item[itemKey] || ''}
                            onChange={(e) => handleArrayItemChange(key, index, itemKey, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={itemKey}
                          />
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item || ''}
                        onChange={(e) => {
                          const array = [...(props[key] || [])];
                          array[index] = e.target.value;
                          handleChange(key, array);
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveArrayItem(key, index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem(key)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Page Settings Panel
function PageSettings({ page, onUpdate, onClose }: {
  page: LandingPage | null;
  onUpdate: (updates: Partial<LandingPage>) => void;
  onClose: () => void;
}) {
  if (!page) return null;
  
  return (
    <div>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Page Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* General Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">General</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Name
              </label>
              <input
                type="text"
                value={page.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={page.slug}
                onChange={(e) => onUpdate({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={page.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* SEO Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">SEO</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={page.metaTitle || ''}
                onChange={(e) => onUpdate({ metaTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                value={page.metaDescription || ''}
                onChange={(e) => onUpdate({ metaDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={page.metaKeywords || ''}
                onChange={(e) => onUpdate({ metaKeywords: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>
        
        {/* Domain Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Domain</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Domain
              </label>
              <input
                type="text"
                value={page.customDomain || ''}
                onChange={(e) => onUpdate({ customDomain: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Configure your DNS to point to our servers
              </p>
            </div>
          </div>
        </div>
        
        {/* Advanced Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom CSS
              </label>
              <textarea
                value={page.css || ''}
                onChange={(e) => onUpdate({ css: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/* Your custom CSS here */"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom JavaScript
              </label>
              <textarea
                value={page.javascript || ''}
                onChange={(e) => onUpdate({ javascript: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="// Your custom JavaScript here"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 