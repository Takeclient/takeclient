'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { loadSortableScript } from '@/app/utils/sortable-client';
import { 
  InboxIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  AtSymbolIcon,
  PhoneIcon,
  CalendarIcon,
  ListBulletIcon,
  StopIcon,
  ChatBubbleLeftRightIcon,
  RectangleStackIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  RadioIcon,
  DocumentTextIcon,
  HashtagIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/solid';
import { generateFieldId } from '../../../utils/id-generator';

// Import CSS
import '../form-builder-enhanced.css';

// TypeScript declarations
declare global {
  interface Window {
    Sortable: any;
  }
}

type SortableInstance = any;

// Field type configurations
const fieldTypes = [
  { 
    type: 'text', 
    label: 'Text Input', 
    icon: CursorArrowRaysIcon,
    defaultLabel: 'Full Name',
    defaultPlaceholder: 'Enter your name'
  },
  { 
    type: 'email', 
    label: 'Email', 
    icon: EnvelopeIcon,
    defaultLabel: 'Email Address',
    defaultPlaceholder: 'your@email.com'
  },
  { 
    type: 'phone', 
    label: 'Phone', 
    icon: PhoneIcon,
    defaultLabel: 'Phone Number',
    defaultPlaceholder: '+1 (555) 000-0000'
  },
  { 
    type: 'number', 
    label: 'Number', 
    icon: HashtagIcon,
    defaultLabel: 'Number',
    defaultPlaceholder: 'Enter a number'
  },
  { 
    type: 'date', 
    label: 'Date', 
    icon: CalendarIcon,
    defaultLabel: 'Date',
    defaultPlaceholder: 'Select a date'
  },
  { 
    type: 'select', 
    label: 'Dropdown', 
    icon: ListBulletIcon,
    defaultLabel: 'Select Option',
    defaultPlaceholder: 'Choose an option'
  },
  { 
    type: 'radio', 
    label: 'Radio Buttons', 
    icon: RadioIcon,
    defaultLabel: 'Choose One',
    defaultPlaceholder: ''
  },
  { 
    type: 'checkbox', 
    label: 'Checkboxes', 
    icon: CheckCircleIcon,
    defaultLabel: 'Select Options',
    defaultPlaceholder: ''
  },
  { 
    type: 'textarea', 
    label: 'Text Area', 
    icon: DocumentTextIcon,
    defaultLabel: 'Message',
    defaultPlaceholder: 'Enter your message here...'
  },
  { 
    type: 'submit', 
    label: 'Submit Button', 
    icon: CheckIcon,
    defaultLabel: 'Submit',
    defaultPlaceholder: ''
  }
];

// Style presets
const formStylePresets = [
  {
    id: 'modern',
    name: 'Modern',
    styles: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: '0px',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '600px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.875rem',
      titleFontWeight: '700',
      titleColor: '#111827',
      descriptionColor: '#6b7280',
      descriptionFontSize: '1rem'
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    styles: {
      backgroundColor: '#f9fafb',
      borderColor: '#d1d5db',
      borderWidth: '1px',
      borderRadius: '8px',
      padding: '1.5rem',
      maxWidth: '600px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      titleFontSize: '1.5rem',
      titleFontWeight: '600',
      titleColor: '#1f2937',
      descriptionColor: '#4b5563',
      descriptionFontSize: '0.875rem'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    styles: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: '0px',
      borderRadius: '0px',
      padding: '2rem',
      maxWidth: '600px',
      boxShadow: 'none',
      titleFontSize: '1.5rem',
      titleFontWeight: '500',
      titleColor: '#000000',
      descriptionColor: '#6b7280',
      descriptionFontSize: '1rem'
    }
  },
  {
    id: 'bold',
    name: 'Bold',
    styles: {
      backgroundColor: '#f3f4f6',
      borderColor: '#6366f1',
      borderWidth: '2px',
      borderRadius: '16px',
      padding: '2.5rem',
      maxWidth: '600px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      titleFontSize: '2rem',
      titleFontWeight: '800',
      titleColor: '#4f46e5',
      descriptionColor: '#4b5563',
      descriptionFontSize: '1.125rem'
    }
  }
];

const buttonStylePresets = [
  {
    id: 'primary',
    name: 'Primary',
    style: {
      backgroundColor: '#6366f1',
      hoverColor: '#4f46e5',
      textColor: '#ffffff',
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      width: 'auto',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      alignment: 'left'
    }
  },
  {
    id: 'secondary',
    name: 'Secondary',
    style: {
      backgroundColor: '#f3f4f6',
      hoverColor: '#e5e7eb',
      textColor: '#374151',
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      width: 'auto',
      boxShadow: 'none',
      alignment: 'left'
    }
  },
  {
    id: 'fullWidth',
    name: 'Full Width',
    style: {
      backgroundColor: '#6366f1',
      hoverColor: '#4f46e5',
      textColor: '#ffffff',
      borderRadius: '6px',
      padding: '0.875rem 1.5rem',
      fontSize: '1.125rem',
      fontWeight: '600',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      alignment: 'center'
    }
  },
  {
    id: 'rounded',
    name: 'Rounded',
    style: {
      backgroundColor: '#10b981',
      hoverColor: '#059669',
      textColor: '#ffffff',
      borderRadius: '9999px',
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      fontWeight: '500',
      width: 'auto',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      alignment: 'left'
    }
  }
];

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface FormBuilderProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function FormBuilder({ initialData, onSave, isEdit = false }: FormBuilderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Form state
  const [formData, setFormData] = useState({
    title: initialData?.title || 'New Form',
    description: initialData?.description || '',
    fields: initialData?.fields || [],
    styles: initialData?.styles || formStylePresets[0].styles,
    buttonStyle: initialData?.buttonStyle || buttonStylePresets[0].style,
    submitText: initialData?.submitText || 'Submit',
    successMessage: initialData?.successMessage || 'Thank you for your submission!',
    redirectUrl: initialData?.redirectUrl || '',
    isActive: initialData?.isActive ?? true
  });
  
  // UI state
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [activeTab, setActiveTab] = useState<'field' | 'form' | 'button'>('field');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSortableReady, setIsSortableReady] = useState(false);
  
  // Refs
  const formCanvasSortableRef = useRef<SortableInstance>(null);
  const formElementsSortableRef = useRef<SortableInstance>(null);
  
  // Initialize sortable
  const initSortables = useCallback(async () => {
    try {
      await loadSortableScript();
      
      if (typeof window !== 'undefined' && window.Sortable) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          // Initialize elements panel
          const elementsEl = document.getElementById('form-elements');
          if (elementsEl) {
            formElementsSortableRef.current = window.Sortable.create(elementsEl, {
              group: { name: 'formBuilder', pull: 'clone', put: false },
              sort: false,
              animation: 150,
              onStart: () => setIsDragging(true),
              onEnd: () => setIsDragging(false)
            });
          }
          
          // Initialize canvas
          const canvasEl = document.getElementById('form-canvas');
          if (canvasEl) {
            formCanvasSortableRef.current = window.Sortable.create(canvasEl, {
              group: { name: 'formBuilder', pull: false, put: true },
              sort: true,
              animation: 150,
              onAdd: (evt: any) => {
                const fieldType = evt.item.getAttribute('data-field-type');
                const config = fieldTypes.find(f => f.type === fieldType);
                
                const newField: FormField = {
                  id: generateFieldId(),
                  type: fieldType,
                  label: config?.defaultLabel || 'New Field',
                  placeholder: config?.defaultPlaceholder,
                  required: false,
                  options: ['select', 'radio', 'checkbox'].includes(fieldType) 
                    ? ['Option 1', 'Option 2', 'Option 3'] 
                    : undefined
                };
                
                // Use functional update to ensure we have the latest state
                setFormData(prev => {
                  const newFields = [...prev.fields];
                  newFields.splice(evt.newIndex, 0, newField);
                  return { ...prev, fields: newFields };
                });
                
                setSelectedField(newField);
                
                evt.item.remove();
              },
              onUpdate: (evt: any) => {
                setFormData(prev => {
                  const newFields = [...prev.fields];
                  const [movedField] = newFields.splice(evt.oldIndex, 1);
                  newFields.splice(evt.newIndex, 0, movedField);
                  return { ...prev, fields: newFields };
                });
              }
            });
          }
          
          setIsSortableReady(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error initializing sortable:', error);
      setIsSortableReady(true); // Set to true even on error to show elements
    }
  }, []);
  
  useEffect(() => {
    initSortables();
    
    return () => {
      if (formCanvasSortableRef.current) {
        formCanvasSortableRef.current.destroy();
      }
      if (formElementsSortableRef.current) {
        formElementsSortableRef.current.destroy();
      }
    };
  }, [initSortables]);
  
  // Field management
  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field: FormField) => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };
  
  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((field: FormField) => field.id !== fieldId)
    }));
    
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };
  
  const duplicateField = (field: FormField) => {
    const newField = {
      ...field,
      id: generateFieldId(),
      label: `${field.label} (Copy)`
    };
    
    const fieldIndex = formData.fields.findIndex((f: FormField) => f.id === field.id);
    const newFields = [...formData.fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    
    setFormData(prev => ({ ...prev, fields: newFields }));
    setSelectedField(newField);
  };
  
  // Save form
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render field preview
  const renderFieldPreview = (field: FormField) => {
    const commonProps = {
      className: 'form-input',
      placeholder: field.placeholder,
      disabled: true
    };
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
        return <input type={field.type} {...commonProps} />;
        
      case 'select':
        return (
          <select {...commonProps} className="form-select">
            <option>{field.placeholder || 'Select an option'}</option>
            {field.options?.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, idx) => (
              <div key={idx} className="form-checkbox-group">
                <input type="radio" className="form-checkbox" disabled />
                <label className="text-sm">{opt}</label>
              </div>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt, idx) => (
              <div key={idx} className="form-checkbox-group">
                <input type="checkbox" className="form-checkbox" disabled />
                <label className="text-sm">{opt}</label>
              </div>
            ))}
          </div>
        );
        
      case 'textarea':
        return (
          <textarea 
            {...commonProps} 
            className="form-textarea" 
            rows={3}
          />
        );
        
      case 'submit':
        return (
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              ...formData.buttonStyle,
              cursor: 'not-allowed',
              opacity: 0.8
            }}
            disabled
          >
            {field.label}
          </button>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="form-builder-container">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-gray-600 mt-1">
            Drag and drop fields to build your form
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setIsPreviewMode(true)}
            className="btn btn-secondary"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || formData.fields.length === 0}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Form
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="form-builder-grid">
        {/* Elements Panel */}
        <div className="form-builder-panel">
          <div className="panel-header">
            <h2 className="panel-title">Form Elements</h2>
          </div>
          <div className="panel-content">
            <div id="form-elements" className="form-elements-grid">
              {!isSortableReady ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-sm">Loading elements...</p>
                </div>
              ) : (
                fieldTypes.map(field => (
                  <div
                    key={field.type}
                    data-field-type={field.type}
                    className="form-element-item"
                  >
                    <div className="form-element-icon">
                      <field.icon className="h-4 w-4" />
                    </div>
                    <span className="form-element-label">{field.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="form-builder-panel">
          <div className="panel-header">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="panel-title bg-transparent border-none outline-none w-full"
              placeholder="Form Title"
            />
          </div>
          <div className="panel-content">
            <div 
              id="form-canvas"
              className={`form-canvas ${isDragging ? 'drag-over' : ''}`}
            >
              {formData.fields.length === 0 ? (
                <div className="form-canvas-empty">
                  <InboxIcon className="form-canvas-empty-icon" />
                  <p className="text-lg font-medium">Drop fields here</p>
                  <p className="text-sm">Start by dragging elements from the left</p>
                </div>
              ) : (
                (formData.fields || []).map((field: FormField, index: number) => (
                  <div
                    key={field.id}
                    data-id={field.id}
                    className={`form-field-preview ${selectedField?.id === field.id ? 'selected' : ''}`}
                    onClick={() => setSelectedField(field)}
                  >
                    <div className="field-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateField(field);
                        }}
                        className="field-action-btn"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteField(field.id);
                        }}
                        className="field-action-btn delete"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFieldPreview(field)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        <div className="form-builder-panel">
          <div className="panel-header">
            <h2 className="panel-title">Properties</h2>
          </div>
          <div className="panel-content">
            {/* Tabs */}
            <div className="properties-tabs">
              <button
                onClick={() => setActiveTab('field')}
                className={`properties-tab ${activeTab === 'field' ? 'active' : ''}`}
              >
                Field
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`properties-tab ${activeTab === 'form' ? 'active' : ''}`}
              >
                Form
              </button>
              <button
                onClick={() => setActiveTab('button')}
                className={`properties-tab ${activeTab === 'button' ? 'active' : ''}`}
              >
                Button
              </button>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'field' && selectedField ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Field Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedField.label}
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Placeholder</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <div className="form-checkbox-group">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedField.required || false}
                      onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                    />
                    <label className="form-label mb-0">Required Field</label>
                  </div>
                </div>
                
                {['select', 'radio', 'checkbox'].includes(selectedField.type) && (
                  <div className="form-group">
                    <label className="form-label">Options</label>
                    {selectedField.options?.map((option, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-input"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(selectedField.options || [])];
                            newOptions[idx] = e.target.value;
                            updateField(selectedField.id, { options: newOptions });
                          }}
                        />
                        <button
                          onClick={() => {
                            const newOptions = selectedField.options?.filter((_, i) => i !== idx);
                            updateField(selectedField.id, { options: newOptions });
                          }}
                          className="field-action-btn delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                        updateField(selectedField.id, { options: newOptions });
                      }}
                      className="btn btn-secondary w-full"
                    >
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ) : activeTab === 'field' ? (
              <div className="text-center text-gray-500 py-8">
                <p>Select a field to edit its properties</p>
              </div>
            ) : null}
            
            {activeTab === 'form' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Form Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your form..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Style Preset</label>
                  <div className="style-presets">
                    {formStylePresets.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => setFormData(prev => ({ ...prev, styles: preset.styles }))}
                        className={`style-preset ${JSON.stringify(formData.styles) === JSON.stringify(preset.styles) ? 'active' : ''}`}
                      >
                        {preset.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Success Message</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formData.successMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, successMessage: e.target.value }))}
                    placeholder="Thank you for your submission!"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Redirect URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    placeholder="https://example.com/thank-you"
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'button' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.submitText}
                    onChange={(e) => setFormData(prev => ({ ...prev, submitText: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Button Style</label>
                  <div className="style-presets">
                    {buttonStylePresets.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => setFormData(prev => ({ ...prev, buttonStyle: preset.style }))}
                        className={`style-preset ${JSON.stringify(formData.buttonStyle) === JSON.stringify(preset.style) ? 'active' : ''}`}
                      >
                        {preset.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Preview Modal */}
      {isPreviewMode && (
        <div className="preview-overlay" onClick={() => setIsPreviewMode(false)}>
          <div 
            className="preview-container"
            onClick={(e) => e.stopPropagation()}
            style={{ width: formData.styles.maxWidth }}
          >
            <button
              onClick={() => setIsPreviewMode(false)}
              className="preview-close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <div style={formData.styles}>
              <h2 
                style={{
                  fontSize: formData.styles.titleFontSize,
                  fontWeight: formData.styles.titleFontWeight,
                  color: formData.styles.titleColor,
                  marginBottom: '0.5rem'
                }}
              >
                {formData.title}
              </h2>
              
              {formData.description && (
                <p 
                  style={{
                    fontSize: formData.styles.descriptionFontSize,
                    color: formData.styles.descriptionColor,
                    marginBottom: '2rem'
                  }}
                >
                  {formData.description}
                </p>
              )}
              
              <form onSubmit={(e) => e.preventDefault()}>
                {formData.fields.map((field: FormField) => (
                  <div key={field.id} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderFieldPreview(field)}
                  </div>
                ))}
                
                <button
                  type="submit"
                  style={{
                    ...formData.buttonStyle,
                    marginTop: '1.5rem',
                    display: formData.buttonStyle.width === '100%' ? 'block' : 'inline-block',
                    textAlign: formData.buttonStyle.alignment as any
                  }}
                  className="btn"
                >
                  {formData.submitText}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 