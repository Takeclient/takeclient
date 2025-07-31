import React, { useState, useEffect } from 'react';
import { enhancedTriggers, enhancedActions } from './workflow-templates';

interface ConfigFieldProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: 'text' | 'select' | 'number' | 'checkbox' | 'tags' | 'multiselect';
  options?: Array<{ value: string; label: string }> | string[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

const ConfigField: React.FC<ConfigFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  description,
  required = false,
}) => {
  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required={required}
          >
            <option value="">Select {label}...</option>
            {options.map((opt) => (
              <option
                key={typeof opt === 'string' ? opt : opt.value}
                value={typeof opt === 'string' ? opt : opt.value}
              >
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {options.map((opt) => {
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isChecked = Array.isArray(value) && value.includes(optValue);
              
              return (
                <label key={optValue} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...(value || []), optValue]);
                      } else {
                        onChange((value || []).filter((v: string) => v !== optValue));
                      }
                    }}
                    className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                  />
                  {optLabel}
                </label>
              );
            })}
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {(value || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => onChange(value.filter((_: string, i: number) => i !== index))}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    onChange([...(value || []), input.value.trim()]);
                    input.value = '';
                  }
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">{placeholder || 'Enable'}</span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required={required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            required={required}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};

// Form Submitted Configuration Component with Form Selection
const FormSubmittedConfig: React.FC<{ config: any; updateConfig: (key: string, value: any) => void }> = ({
  config,
  updateConfig,
}) => {
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableForms();
  }, []);

  const fetchAvailableForms = async () => {
    try {
      const response = await fetch('/api/workflows/forms');
      if (response.ok) {
        const data = await response.json();
        setAvailableForms(data.forms || []);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specific Forms <span className="text-red-500">*</span>
        </label>
        {loading ? (
          <div className="text-sm text-gray-500">Loading forms...</div>
        ) : availableForms.length === 0 ? (
          <div className="text-sm text-gray-500">
            No forms found. Create forms in the Form Builder first.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-2">
              Select which forms should trigger this workflow:
            </div>
            {availableForms.map((form) => {
              const isSelected = Array.isArray(config.formIds) && config.formIds.includes(form.id);
              
              return (
                <label key={form.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const formIds = config.formIds || [];
                      if (e.target.checked) {
                        updateConfig('formIds', [...formIds, form.id]);
                      } else {
                        updateConfig('formIds', formIds.filter((id: string) => id !== form.id));
                      }
                    }}
                    className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{form.name}</div>
                    {form.description && (
                      <div className="text-xs text-gray-500 mt-1">{form.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {form.submissionCount} submissions • Created {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </label>
              );
            })}
            
            {config.formIds && config.formIds.length === 0 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ No forms selected. This workflow will trigger for all form submissions.
              </div>
            )}
          </div>
        )}
      </div>

      <ConfigField
        label="Lead Scoring"
        value={config.enableScoring}
        onChange={(value) => updateConfig('enableScoring', value)}
        type="checkbox"
        placeholder="Enable automatic lead scoring"
        description="Automatically assign lead scores based on form data"
      />

      <ConfigField
        label="Required Fields"
        value={config.requiredFields}
        onChange={(value) => updateConfig('requiredFields', value)}
        type="multiselect"
        options={['email', 'phone', 'company', 'jobTitle', 'industry']}
        description="Only trigger if these fields are filled in the form"
      />

      <ConfigField
        label="Contact Creation"
        value={config.createContact}
        onChange={(value) => updateConfig('createContact', value)}
        type="checkbox"
        placeholder="Automatically create contact from form data"
        description="Create a new contact if email doesn't exist"
      />
    </div>
  );
};

export const getNodeConfig = (nodeType: string, nodeData: any, updateConfig: (key: string, value: any) => void) => {
  const config = nodeData.config || {};

  // Find the trigger/action definition
  const allTriggers = Object.values(enhancedTriggers).flat();
  const allActions = Object.values(enhancedActions).flat();
  const nodeDefinition = [...allTriggers, ...allActions].find(item => item.value === nodeType);

  if (!nodeDefinition) {
    return <p className="text-sm text-gray-500">No configuration available for this node type.</p>;
  }

  // Render configuration based on node type
  switch (nodeType) {
    // CRM Triggers
    case 'CONTACT_CREATED':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Filter by Source"
            value={config.source}
            onChange={(value) => updateConfig('source', value)}
            type="select"
            options={['website', 'form', 'import', 'api', 'manual', 'social']}
            description="Only trigger for contacts from specific sources"
          />
          <ConfigField
            label="Required Tags"
            value={config.requiredTags}
            onChange={(value) => updateConfig('requiredTags', value)}
            type="tags"
            description="Only trigger if contact has these tags"
          />
          <ConfigField
            label="Assigned To"
            value={config.assignedTo}
            onChange={(value) => updateConfig('assignedTo', value)}
            type="select"
            options={[
              { value: 'any', label: 'Any User' },
              { value: 'specific', label: 'Specific User' },
              { value: 'team', label: 'Specific Team' },
              { value: 'unassigned', label: 'Unassigned Only' },
            ]}
          />
        </div>
      );

    case 'DEAL_CREATED':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Minimum Deal Value"
            value={config.minValue}
            onChange={(value) => updateConfig('minValue', value)}
            type="number"
            placeholder="0"
            description="Only trigger for deals above this value"
          />
          <ConfigField
            label="Deal Stages"
            value={config.stages}
            onChange={(value) => updateConfig('stages', value)}
            type="multiselect"
            options={['prospecting', 'qualification', 'proposal', 'negotiation', 'closed']}
            description="Only trigger for specific stages"
          />
          <ConfigField
            label="Product Filter"
            value={config.productFilter}
            onChange={(value) => updateConfig('productFilter', value)}
            type="select"
            options={[
              { value: 'any', label: 'Any Product' },
              { value: 'specific', label: 'Specific Products' },
              { value: 'category', label: 'Product Category' },
            ]}
          />
        </div>
      );

    // Marketing Triggers
    case 'EMAIL_OPENED':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Email Campaign"
            value={config.campaignId}
            onChange={(value) => updateConfig('campaignId', value)}
            type="select"
            options={[
              { value: 'any', label: 'Any Email' },
              { value: 'specific', label: 'Specific Campaign' },
              { value: 'transactional', label: 'Transactional Emails' },
              { value: 'marketing', label: 'Marketing Emails' },
            ]}
          />
          <ConfigField
            label="Open Count"
            value={config.openCount}
            onChange={(value) => updateConfig('openCount', value)}
            type="select"
            options={[
              { value: 'first', label: 'First Open Only' },
              { value: 'every', label: 'Every Open' },
              { value: 'multiple', label: 'After Multiple Opens' },
            ]}
          />
          <ConfigField
            label="Device Type"
            value={config.deviceTypes}
            onChange={(value) => updateConfig('deviceTypes', value)}
            type="multiselect"
            options={['desktop', 'mobile', 'tablet']}
            description="Filter by device type"
          />
        </div>
      );

    case 'FORM_SUBMITTED':
      return <FormSubmittedConfig config={config} updateConfig={updateConfig} />;

    case 'WHATSAPP_MESSAGE_RECEIVED':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Phone Numbers"
            value={config.phoneNumbers}
            onChange={(value) => updateConfig('phoneNumbers', value)}
            type="tags"
            placeholder="Add phone numbers..."
            description="Only trigger for messages from specific numbers (leave empty for all)"
          />
          <ConfigField
            label="Message Keywords"
            value={config.messageKeywords}
            onChange={(value) => updateConfig('messageKeywords', value)}
            type="tags"
            placeholder="Add keywords..."
            description="Only trigger when message contains these keywords"
          />
          <ConfigField
            label="Message Type"
            value={config.messageTypes}
            onChange={(value) => updateConfig('messageTypes', value)}
            type="multiselect"
            options={['text', 'image', 'document', 'audio', 'video']}
            description="Filter by message type"
          />
        </div>
      );

    // Sales Triggers
    case 'QUOTATION_SENT':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Value Range"
            value={config.minValue}
            onChange={(value) => updateConfig('minValue', value)}
            type="number"
            placeholder="Minimum value"
            description="Only trigger for quotes above this value"
          />
          <ConfigField
            label="Product Categories"
            value={config.productCategories}
            onChange={(value) => updateConfig('productCategories', value)}
            type="multiselect"
            options={['software', 'services', 'hardware', 'subscription']}
            description="Filter by product categories"
          />
          <ConfigField
            label="Validity Period (Days)"
            value={config.validityDays}
            onChange={(value) => updateConfig('validityDays', value)}
            type="number"
            placeholder="30"
            description="Quote validity period"
          />
        </div>
      );

    // Ecommerce Triggers
    case 'CART_ABANDONED':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Minimum Cart Value"
            value={config.minCartValue}
            onChange={(value) => updateConfig('minCartValue', value)}
            type="number"
            placeholder="50"
            description="Only trigger for carts above this value"
          />
          <ConfigField
            label="Wait Time (Minutes)"
            value={config.waitMinutes}
            onChange={(value) => updateConfig('waitMinutes', value)}
            type="number"
            placeholder="60"
            description="Minutes to wait before considering cart abandoned"
          />
          <ConfigField
            label="Product Types"
            value={config.productTypes}
            onChange={(value) => updateConfig('productTypes', value)}
            type="multiselect"
            options={['physical', 'digital', 'subscription', 'service']}
          />
        </div>
      );

    // CRM Actions
    case 'UPDATE_CONTACT':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Update Type"
            value={config.updateType}
            onChange={(value) => updateConfig('updateType', value)}
            type="select"
            options={[
              { value: 'fields', label: 'Update Fields' },
              { value: 'tags', label: 'Add/Remove Tags' },
              { value: 'score', label: 'Update Score' },
              { value: 'custom', label: 'Custom Fields' },
            ]}
            required
          />
          {config.updateType === 'tags' && (
            <>
              <ConfigField
                label="Tags to Add"
                value={config.addTags}
                onChange={(value) => updateConfig('addTags', value)}
                type="tags"
                description="Tags to add to the contact"
              />
              <ConfigField
                label="Tags to Remove"
                value={config.removeTags}
                onChange={(value) => updateConfig('removeTags', value)}
                type="tags"
                description="Tags to remove from the contact"
              />
            </>
          )}
          {config.updateType === 'score' && (
            <>
              <ConfigField
                label="Score Operation"
                value={config.scoreOperation}
                onChange={(value) => updateConfig('scoreOperation', value)}
                type="select"
                options={[
                  { value: 'add', label: 'Add to Score' },
                  { value: 'subtract', label: 'Subtract from Score' },
                  { value: 'set', label: 'Set Score To' },
                  { value: 'multiply', label: 'Multiply Score By' },
                ]}
              />
              <ConfigField
                label="Score Value"
                value={config.scoreValue}
                onChange={(value) => updateConfig('scoreValue', value)}
                type="number"
                placeholder="10"
                required
              />
            </>
          )}
        </div>
      );

    case 'CREATE_TASK':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Task Title"
            value={config.title}
            onChange={(value) => updateConfig('title', value)}
            type="text"
            placeholder="Follow up with {{contact.firstName}}"
            description="Use {{variables}} for dynamic content"
            required
          />
          <ConfigField
            label="Task Type"
            value={config.taskType}
            onChange={(value) => updateConfig('taskType', value)}
            type="select"
            options={[
              { value: 'call', label: 'Phone Call' },
              { value: 'email', label: 'Email' },
              { value: 'meeting', label: 'Meeting' },
              { value: 'follow-up', label: 'Follow Up' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <ConfigField
            label="Priority"
            value={config.priority}
            onChange={(value) => updateConfig('priority', value)}
            type="select"
            options={['low', 'medium', 'high', 'urgent']}
          />
          <ConfigField
            label="Due In (Days)"
            value={config.dueInDays}
            onChange={(value) => updateConfig('dueInDays', value)}
            type="number"
            placeholder="3"
            description="Days from now when task is due"
          />
          <ConfigField
            label="Assignment"
            value={config.assignTo}
            onChange={(value) => updateConfig('assignTo', value)}
            type="select"
            options={[
              { value: 'contact-owner', label: 'Contact Owner' },
              { value: 'specific-user', label: 'Specific User' },
              { value: 'team', label: 'Team' },
              { value: 'round-robin', label: 'Round Robin' },
            ]}
          />
        </div>
      );

    // Marketing Actions
    case 'SEND_EMAIL':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Email Template"
            value={config.templateId}
            onChange={(value) => updateConfig('templateId', value)}
            type="select"
            options={[
              { value: 'welcome', label: 'Welcome Email' },
              { value: 'follow-up', label: 'Follow Up' },
              { value: 'newsletter', label: 'Newsletter' },
              { value: 'promotional', label: 'Promotional' },
              { value: 'custom', label: 'Custom Template' },
            ]}
            required
          />
          <ConfigField
            label="Subject Line"
            value={config.subject}
            onChange={(value) => updateConfig('subject', value)}
            type="text"
            placeholder="Welcome to {{company.name}}, {{contact.firstName}}!"
            description="Use merge tags for personalization"
          />
          <ConfigField
            label="Track Opens"
            value={config.trackOpens}
            onChange={(value) => updateConfig('trackOpens', value)}
            type="checkbox"
            placeholder="Track email opens"
          />
          <ConfigField
            label="Track Clicks"
            value={config.trackClicks}
            onChange={(value) => updateConfig('trackClicks', value)}
            type="checkbox"
            placeholder="Track link clicks"
          />
          <ConfigField
            label="A/B Testing"
            value={config.enableABTesting}
            onChange={(value) => updateConfig('enableABTesting', value)}
            type="checkbox"
            placeholder="Enable A/B testing"
          />
        </div>
      );

    // Sales Actions
    case 'CREATE_QUOTATION':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Quote Template"
            value={config.template}
            onChange={(value) => updateConfig('template', value)}
            type="select"
            options={[
              { value: 'standard', label: 'Standard Quote' },
              { value: 'service', label: 'Service Quote' },
              { value: 'product', label: 'Product Quote' },
              { value: 'custom', label: 'Custom Template' },
            ]}
            required
          />
          <ConfigField
            label="Validity (Days)"
            value={config.validityDays}
            onChange={(value) => updateConfig('validityDays', value)}
            type="number"
            placeholder="30"
            description="How long the quote is valid"
          />
          <ConfigField
            label="Auto-Approve"
            value={config.autoApprove}
            onChange={(value) => updateConfig('autoApprove', value)}
            type="checkbox"
            placeholder="Automatically approve quote"
          />
          <ConfigField
            label="Include Terms"
            value={config.includeTerms}
            onChange={(value) => updateConfig('includeTerms', value)}
            type="checkbox"
            placeholder="Include standard terms and conditions"
          />
        </div>
      );

    // Ecommerce Actions
    case 'APPLY_DISCOUNT':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Discount Type"
            value={config.discountType}
            onChange={(value) => updateConfig('discountType', value)}
            type="select"
            options={[
              { value: 'percentage', label: 'Percentage Off' },
              { value: 'fixed', label: 'Fixed Amount Off' },
              { value: 'free-shipping', label: 'Free Shipping' },
              { value: 'bogo', label: 'Buy One Get One' },
            ]}
            required
          />
          <ConfigField
            label="Discount Value"
            value={config.discountValue}
            onChange={(value) => updateConfig('discountValue', value)}
            type="number"
            placeholder={config.discountType === 'percentage' ? '10' : '25'}
            description={config.discountType === 'percentage' ? 'Percentage off' : 'Amount off'}
          />
          <ConfigField
            label="Minimum Purchase"
            value={config.minPurchase}
            onChange={(value) => updateConfig('minPurchase', value)}
            type="number"
            placeholder="0"
            description="Minimum order value to apply discount"
          />
          <ConfigField
            label="Valid For (Hours)"
            value={config.validHours}
            onChange={(value) => updateConfig('validHours', value)}
            type="number"
            placeholder="24"
            description="How long the discount is valid"
          />
        </div>
      );

    // Control Flow Actions
    case 'WAIT':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Wait Type"
            value={config.waitType}
            onChange={(value) => updateConfig('waitType', value)}
            type="select"
            options={[
              { value: 'time', label: 'Wait for Duration' },
              { value: 'date', label: 'Wait Until Date' },
              { value: 'event', label: 'Wait for Event' },
            ]}
          />
          {config.waitType === 'time' && (
            <>
              <ConfigField
                label="Duration"
                value={config.duration}
                onChange={(value) => updateConfig('duration', value)}
                type="number"
                placeholder="5"
                required
              />
              <ConfigField
                label="Unit"
                value={config.unit}
                onChange={(value) => updateConfig('unit', value)}
                type="select"
                options={['minutes', 'hours', 'days', 'weeks']}
                required
              />
            </>
          )}
          {config.waitType === 'event' && (
            <ConfigField
              label="Event Type"
              value={config.eventType}
              onChange={(value) => updateConfig('eventType', value)}
              type="select"
              options={[
                { value: 'email-opened', label: 'Email Opened' },
                { value: 'link-clicked', label: 'Link Clicked' },
                { value: 'form-submitted', label: 'Form Submitted' },
                { value: 'deal-closed', label: 'Deal Closed' },
              ]}
            />
          )}
        </div>
      );

    case 'BRANCH_CONDITION':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Condition Type"
            value={config.conditionType}
            onChange={(value) => updateConfig('conditionType', value)}
            type="select"
            options={[
              { value: 'field-value', label: 'Field Value' },
              { value: 'tag-exists', label: 'Has Tag' },
              { value: 'score-range', label: 'Score Range' },
              { value: 'date-comparison', label: 'Date Comparison' },
              { value: 'custom', label: 'Custom Condition' },
            ]}
            required
          />
          {config.conditionType === 'field-value' && (
            <>
              <ConfigField
                label="Field"
                value={config.field}
                onChange={(value) => updateConfig('field', value)}
                type="select"
                options={[
                  { value: 'contact.stage', label: 'Contact Stage' },
                  { value: 'contact.score', label: 'Lead Score' },
                  { value: 'deal.value', label: 'Deal Value' },
                  { value: 'contact.email', label: 'Email' },
                  { value: 'custom', label: 'Custom Field' },
                ]}
              />
              <ConfigField
                label="Operator"
                value={config.operator}
                onChange={(value) => updateConfig('operator', value)}
                type="select"
                options={[
                  { value: 'equals', label: 'Equals' },
                  { value: 'not-equals', label: 'Not Equals' },
                  { value: 'greater-than', label: 'Greater Than' },
                  { value: 'less-than', label: 'Less Than' },
                  { value: 'contains', label: 'Contains' },
                  { value: 'starts-with', label: 'Starts With' },
                  { value: 'ends-with', label: 'Ends With' },
                ]}
              />
              <ConfigField
                label="Value"
                value={config.value}
                onChange={(value) => updateConfig('value', value)}
                type="text"
                placeholder="Enter comparison value"
              />
            </>
          )}
          <ConfigField
            label="Logic"
            value={config.logic}
            onChange={(value) => updateConfig('logic', value)}
            type="select"
            options={[
              { value: 'and', label: 'All conditions must match (AND)' },
              { value: 'or', label: 'Any condition can match (OR)' },
            ]}
            description="How to combine multiple conditions"
          />
        </div>
      );

    case 'WEBHOOK':
      return (
        <div className="space-y-4">
          <ConfigField
            label="Webhook URL"
            value={config.url}
            onChange={(value) => updateConfig('url', value)}
            type="text"
            placeholder="https://api.example.com/webhook"
            required
          />
          <ConfigField
            label="HTTP Method"
            value={config.method}
            onChange={(value) => updateConfig('method', value)}
            type="select"
            options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH']}
          />
          <ConfigField
            label="Authentication"
            value={config.authType}
            onChange={(value) => updateConfig('authType', value)}
            type="select"
            options={[
              { value: 'none', label: 'No Authentication' },
              { value: 'api-key', label: 'API Key' },
              { value: 'bearer', label: 'Bearer Token' },
              { value: 'basic', label: 'Basic Auth' },
              { value: 'oauth', label: 'OAuth 2.0' },
            ]}
          />
          {config.authType !== 'none' && (
            <ConfigField
              label="Authentication Value"
              value={config.authValue}
              onChange={(value) => updateConfig('authValue', value)}
              type="text"
              placeholder={config.authType === 'api-key' ? 'Your API Key' : 'Auth Token'}
            />
          )}
          <ConfigField
            label="Retry on Failure"
            value={config.retries}
            onChange={(value) => updateConfig('retries', value)}
            type="select"
            options={[
              { value: '0', label: 'No Retries' },
              { value: '1', label: '1 Retry' },
              { value: '3', label: '3 Retries' },
              { value: '5', label: '5 Retries' },
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Advanced configuration for {nodeData.label} will be available soon.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              {nodeData.description}
            </p>
          </div>
        </div>
      );
  }
}; 