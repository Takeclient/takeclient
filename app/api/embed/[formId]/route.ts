import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const { searchParams } = new URL(req.url);
    const theme = searchParams.get('theme') || 'light';
    
    // Find form by embedCode or ID
    const form = await prisma.form.findFirst({
      where: {
        OR: [
          { id: formId },
          { embedCode: { contains: formId } }
        ],
        isActive: true
      },
      include: {
        tenant: true
      }
    });

    if (!form) {
      return new NextResponse('Form not found', { status: 404 });
    }

    // Generate the embed JavaScript
    const embedScript = generateEmbedScript(form, theme);

    return new NextResponse(embedScript, {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving embed script:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function generateEmbedScript(form: any, theme: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  return `
(function() {
  'use strict';
  
  // Form configuration
  const formConfig = {
    id: '${form.id}',
    title: '${form.title}',
    description: '${form.description || ''}',
    fields: ${JSON.stringify(form.fields)},
    styles: ${JSON.stringify(form.styles || {})},
    buttonStyle: ${JSON.stringify(form.buttonStyle || {})},
    submitText: '${form.submitText || 'Submit'}',
    successMessage: '${form.successMessage || 'Thank you for your submission!'}',
    redirectUrl: '${form.redirectUrl || ''}',
    theme: '${theme}',
    apiUrl: '${baseUrl}/api/forms/${form.id}/submit'
  };
  
  // Find the container
  const containerId = 'crm-form-${form.id}';
  let container = document.getElementById(containerId);
  
  // If container not found, look for any div with class crm-form
  if (!container) {
    container = document.querySelector('.crm-form-embed');
  }
  
  // If still not found, create one
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  // Theme styles
  const themes = {
    light: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      borderColor: '#d1d5db',
      primaryColor: '#3b82f6',
      primaryHover: '#2563eb',
      inputBackground: '#ffffff',
      inputBorder: '#d1d5db',
      inputFocus: '#3b82f6'
    },
    dark: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      borderColor: '#374151',
      primaryColor: '#60a5fa',
      primaryHover: '#3b82f6',
      inputBackground: '#374151',
      inputBorder: '#4b5563',
      inputFocus: '#60a5fa'
    },
    minimal: {
      backgroundColor: 'transparent',
      textColor: '#111827',
      borderColor: '#e5e7eb',
      primaryColor: '#000000',
      primaryHover: '#374151',
      inputBackground: '#ffffff',
      inputBorder: '#e5e7eb',
      inputFocus: '#000000'
    }
  };
  
  const themeColors = themes[formConfig.theme] || themes.light;
  
  // Inject CSS
  function injectCSS() {
    const existingStyle = document.getElementById('crm-form-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'crm-form-styles';
    style.textContent = \`
      .crm-form-container {
        background-color: \${themeColors.backgroundColor};
        color: \${themeColors.textColor};
        border: 1px solid \${themeColors.borderColor};
        border-radius: 8px;
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .crm-form-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
        color: \${themeColors.textColor};
      }
      
      .crm-form-description {
        font-size: 16px;
        margin-bottom: 24px;
        color: \${themeColors.textColor};
        opacity: 0.8;
      }
      
      .crm-form-field {
        margin-bottom: 20px;
      }
      
      .crm-form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 6px;
        color: \${themeColors.textColor};
      }
      
      .crm-form-required {
        color: #ef4444;
        margin-left: 2px;
      }
      
      .crm-form-input,
      .crm-form-select,
      .crm-form-textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid \${themeColors.inputBorder};
        border-radius: 6px;
        background-color: \${themeColors.inputBackground};
        color: \${themeColors.textColor};
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      }
      
      .crm-form-input:focus,
      .crm-form-select:focus,
      .crm-form-textarea:focus {
        outline: none;
        border-color: \${themeColors.inputFocus};
        box-shadow: 0 0 0 3px \${themeColors.inputFocus}20;
      }
      
      .crm-form-checkbox-group,
      .crm-form-radio-group {
        margin-bottom: 12px;
      }
      
      .crm-form-checkbox-item,
      .crm-form-radio-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .crm-form-checkbox,
      .crm-form-radio {
        margin-right: 8px;
        accent-color: \${themeColors.primaryColor};
      }
      
      .crm-form-submit {
        background-color: \${themeColors.primaryColor};
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        width: 100%;
      }
      
      .crm-form-submit:hover {
        background-color: \${themeColors.primaryHover};
      }
      
      .crm-form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .crm-form-loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: crm-spin 1s linear infinite;
        margin-right: 8px;
      }
      
      .crm-form-success {
        background-color: #10b981;
        color: white;
        padding: 16px;
        border-radius: 6px;
        text-align: center;
        margin-bottom: 16px;
      }
      
      .crm-form-error {
        background-color: #ef4444;
        color: white;
        padding: 16px;
        border-radius: 6px;
        text-align: center;
        margin-bottom: 16px;
      }
      
      @keyframes crm-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    \`;
    document.head.appendChild(style);
  }
  
  // Create form HTML
  function createFormHTML() {
    let html = \`
      <div class="crm-form-container">
        <div id="crm-form-messages"></div>
        \${formConfig.title ? \`<h2 class="crm-form-title">\${formConfig.title}</h2>\` : ''}
        \${formConfig.description ? \`<p class="crm-form-description">\${formConfig.description}</p>\` : ''}
        <form id="crm-form-\${formConfig.id}">
    \`;
    
    formConfig.fields.forEach(field => {
      if (field.type === 'submit') return;
      
      html += \`<div class="crm-form-field">\`;
      
      if (field.type !== 'checkbox' && field.type !== 'radio') {
        html += \`
          <label class="crm-form-label" for="field-\${field.id}">
            \${field.label}
            \${field.required ? '<span class="crm-form-required">*</span>' : ''}
          </label>
        \`;
      }
      
      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
        case 'date':
          html += \`
            <input 
              type="\${field.type}" 
              id="field-\${field.id}" 
              name="\${field.id}" 
              class="crm-form-input"
              placeholder="\${field.placeholder || ''}"
              \${field.required ? 'required' : ''}
            />
          \`;
          break;
          
        case 'textarea':
          html += \`
            <textarea 
              id="field-\${field.id}" 
              name="\${field.id}" 
              class="crm-form-textarea"
              placeholder="\${field.placeholder || ''}"
              rows="4"
              \${field.required ? 'required' : ''}
            ></textarea>
          \`;
          break;
          
        case 'select':
          html += \`<select id="field-\${field.id}" name="\${field.id}" class="crm-form-select" \${field.required ? 'required' : ''}>\`;
          html += \`<option value="">\${field.placeholder || 'Select an option'}</option>\`;
          if (field.options) {
            field.options.forEach(option => {
              html += \`<option value="\${option}">\${option}</option>\`;
            });
          }
          html += \`</select>\`;
          break;
          
        case 'radio':
          html += \`<div class="crm-form-radio-group">\`;
          if (field.options) {
            field.options.forEach((option, index) => {
              html += \`
                <div class="crm-form-radio-item">
                  <input 
                    type="radio" 
                    id="field-\${field.id}-\${index}" 
                    name="\${field.id}" 
                    value="\${option}"
                    class="crm-form-radio"
                    \${field.required && index === 0 ? 'required' : ''}
                  />
                  <label for="field-\${field.id}-\${index}">\${option}</label>
                </div>
              \`;
            });
          }
          html += \`</div>\`;
          break;
          
        case 'checkbox':
          html += \`<div class="crm-form-checkbox-group">\`;
          if (field.options) {
            field.options.forEach((option, index) => {
              html += \`
                <div class="crm-form-checkbox-item">
                  <input 
                    type="checkbox" 
                    id="field-\${field.id}-\${index}" 
                    name="\${field.id}" 
                    value="\${option}"
                    class="crm-form-checkbox"
                  />
                  <label for="field-\${field.id}-\${index}">\${option}</label>
                </div>
              \`;
            });
          }
          html += \`</div>\`;
          break;
      }
      
      html += \`</div>\`;
    });
    
    html += \`
          <button type="submit" class="crm-form-submit">
            \${formConfig.submitText}
          </button>
        </form>
      </div>
    \`;
    
    return html;
  }
  
  // Show message
  function showMessage(message, type = 'success') {
    const messagesContainer = document.getElementById('crm-form-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = \`
        <div class="crm-form-\${type}">
          \${message}
        </div>
      \`;
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        messagesContainer.innerHTML = '';
      }, 5000);
    }
  }
  
  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.crm-form-submit');
    const formData = new FormData(form);
    
    // Collect checkbox values
    const checkboxGroups = {};
    formConfig.fields.forEach(field => {
      if (field.type === 'checkbox') {
        const checkboxes = form.querySelectorAll(\`input[name="\${field.id}"]:checked\`);
        checkboxGroups[field.id] = Array.from(checkboxes).map(cb => cb.value);
      }
    });
    
    // Prepare submission data
    const submissionData = {};
    for (let [key, value] of formData.entries()) {
      submissionData[key] = value;
    }
    
    // Add checkbox values
    Object.keys(checkboxGroups).forEach(key => {
      submissionData[key] = checkboxGroups[key];
    });
    
    // Show loading state
    submitButton.disabled = true;
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="crm-form-loading"></span>Submitting...';
    
    // Submit to API
    fetch(formConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showMessage(formConfig.successMessage, 'success');
        form.reset();
        
        // Redirect if URL provided
        if (formConfig.redirectUrl) {
          setTimeout(() => {
            window.open(formConfig.redirectUrl, '_blank');
          }, 2000);
        }
      } else {
        showMessage(data.error || 'Submission failed. Please try again.', 'error');
      }
    })
    .catch(error => {
      console.error('Form submission error:', error);
      showMessage('Submission failed. Please try again.', 'error');
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    });
  }
  
  // Initialize the form
  function init() {
    injectCSS();
    container.innerHTML = createFormHTML();
    
    const form = document.getElementById(\`crm-form-\${formConfig.id}\`);
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
  `;
} 