(function() {
  // Get script parameters
  const script = document.currentScript;
  const scriptUrl = new URL(script.src);
  const formId = scriptUrl.searchParams.get('id');
  const containerId = `crm-form-${formId}`;
  
  // Find or create container
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    script.parentNode.insertBefore(container, script.nextSibling);
  }
  
  // API base URL
  const apiBase = scriptUrl.origin;
  
  // Load form data
  async function loadForm() {
    try {
      const response = await fetch(`${apiBase}/api/forms/public/${formId}`);
      if (!response.ok) {
        throw new Error('Form not found');
      }
      
      const form = await response.json();
      renderForm(form);
    } catch (error) {
      container.innerHTML = '<p style="color: red;">Error loading form</p>';
      console.error('Error loading form:', error);
    }
  }
  
  // Render form
  function renderForm(form) {
    if (!form.isActive) {
      container.innerHTML = '<p>This form is no longer accepting submissions.</p>';
      return;
    }
    
    const formHtml = `
      <div id="${containerId}-wrapper" style="${getStyleString(form.styles)}">
        <h2 style="font-size: ${form.styles.titleFontSize}; font-weight: ${form.styles.titleFontWeight}; color: ${form.styles.titleColor}; margin-bottom: 0.5rem;">
          ${form.title}
        </h2>
        ${form.description ? `
          <p style="font-size: ${form.styles.descriptionFontSize}; color: ${form.styles.descriptionColor}; margin-bottom: 2rem;">
            ${form.description}
          </p>
        ` : ''}
        <form id="${containerId}-form" style="margin-top: 1.5rem;">
          ${form.fields.map(field => renderField(field)).join('')}
          <button type="submit" style="${getStyleString(form.buttonStyle)}; margin-top: 1.5rem; cursor: pointer; border: none;">
            ${form.submitText || 'Submit'}
          </button>
        </form>
        <div id="${containerId}-message" style="margin-top: 1rem; display: none;"></div>
      </div>
    `;
    
    container.innerHTML = formHtml;
    
    // Attach event listener
    const formElement = document.getElementById(`${containerId}-form`);
    formElement.addEventListener('submit', (e) => handleSubmit(e, form));
  }
  
  // Render individual field
  function renderField(field) {
    const fieldId = `${containerId}-${field.id}`;
    const labelStyle = 'display: block; margin-bottom: 0.5rem; font-weight: 500;';
    const inputStyle = 'width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 1rem;';
    
    let fieldHtml = `
      <div style="margin-bottom: 1rem;">
        <label for="${fieldId}" style="${labelStyle}">
          ${field.label}
          ${field.required ? '<span style="color: red;">*</span>' : ''}
        </label>
    `;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
        fieldHtml += `
          <input 
            type="${field.type}" 
            id="${fieldId}" 
            name="${field.id}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
            style="${inputStyle}"
          />
        `;
        break;
        
      case 'select':
        fieldHtml += `
          <select 
            id="${fieldId}" 
            name="${field.id}"
            ${field.required ? 'required' : ''}
            style="${inputStyle}"
          >
            <option value="">${field.placeholder || 'Select an option'}</option>
            ${(field.options || []).map(opt => `
              <option value="${opt}">${opt}</option>
            `).join('')}
          </select>
        `;
        break;
        
      case 'radio':
        fieldHtml += `<div>`;
        (field.options || []).forEach((opt, idx) => {
          const optId = `${fieldId}-${idx}`;
          fieldHtml += `
            <div style="margin-bottom: 0.5rem;">
              <input 
                type="radio" 
                id="${optId}" 
                name="${field.id}"
                value="${opt}"
                ${field.required && idx === 0 ? 'required' : ''}
                style="margin-right: 0.5rem;"
              />
              <label for="${optId}">${opt}</label>
            </div>
          `;
        });
        fieldHtml += `</div>`;
        break;
        
      case 'checkbox':
        fieldHtml += `<div>`;
        (field.options || []).forEach((opt, idx) => {
          const optId = `${fieldId}-${idx}`;
          fieldHtml += `
            <div style="margin-bottom: 0.5rem;">
              <input 
                type="checkbox" 
                id="${optId}" 
                name="${field.id}"
                value="${opt}"
                style="margin-right: 0.5rem;"
              />
              <label for="${optId}">${opt}</label>
            </div>
          `;
        });
        fieldHtml += `</div>`;
        break;
        
      case 'textarea':
        fieldHtml += `
          <textarea 
            id="${fieldId}" 
            name="${field.id}"
            placeholder="${field.placeholder || ''}"
            ${field.required ? 'required' : ''}
            rows="4"
            style="${inputStyle}"
          ></textarea>
        `;
        break;
    }
    
    fieldHtml += `</div>`;
    return fieldHtml;
  }
  
  // Handle form submission
  async function handleSubmit(e, form) {
    e.preventDefault();
    
    const formElement = e.target;
    const submitButton = formElement.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById(`${containerId}-message`);
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Collect form data
    const formData = new FormData(formElement);
    const submissionData = {};
    
    form.fields.forEach(field => {
      if (field.type === 'checkbox') {
        // Handle multiple checkboxes
        const values = formData.getAll(field.id);
        submissionData[field.id] = values.length > 0 ? values : null;
      } else {
        submissionData[field.id] = formData.get(field.id) || null;
      }
    });
    
    try {
      const response = await fetch(`${apiBase}/api/forms/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form.id,
          submissionData: submissionData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      const result = await response.json();
      
      // Show success message
      messageDiv.style.display = 'block';
      messageDiv.style.color = 'green';
      messageDiv.textContent = result.message || form.successMessage || 'Thank you for your submission!';
      
      // Clear form
      formElement.reset();
      
      // Redirect if specified
      if (result.redirectUrl || form.redirectUrl) {
        setTimeout(() => {
          window.location.href = result.redirectUrl || form.redirectUrl;
        }, 2000);
      }
    } catch (error) {
      messageDiv.style.display = 'block';
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'An error occurred. Please try again.';
      console.error('Submission error:', error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = form.submitText || 'Submit';
    }
  }
  
  // Convert style object to CSS string
  function getStyleString(styles) {
    const styleMap = {
      backgroundColor: 'background-color',
      borderColor: 'border-color',
      borderWidth: 'border-width',
      borderRadius: 'border-radius',
      padding: 'padding',
      maxWidth: 'max-width',
      boxShadow: 'box-shadow',
      textColor: 'color',
      fontSize: 'font-size',
      fontWeight: 'font-weight',
      width: 'width',
      hoverColor: 'hover-color',
      alignment: 'text-align'
    };
    
    return Object.entries(styles || {})
      .filter(([key]) => key !== 'hoverColor' && key !== 'alignment')
      .map(([key, value]) => {
        const cssKey = styleMap[key] || key;
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }
  
  // Load the form
  loadForm();
})(); 