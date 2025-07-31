import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { triggerWorkflows } from '@/app/lib/workflow-triggers';

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params;
    const submissionData = await req.json();

    // Find the form
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        isActive: true
      },
      include: {
        tenant: true
      }
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Parse and validate form fields
    const formFields: FormField[] = Array.isArray(form.fields) ? form.fields as unknown as FormField[] : [];
    
    if (formFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Form has no fields configured' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = formFields.filter(field => field.required && field.type !== 'submit');
    const missingFields = [];

    for (const field of requiredFields) {
      const value = submissionData[field.id];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(field.label);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Please fill in required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Process submission data
    const processedData: any = {};
    
    formFields.forEach(field => {
      if (field.type === 'submit') return;
      
      const value = submissionData[field.id];
      
      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'checkbox' && Array.isArray(value)) {
          processedData[field.id] = value.join(', ');
        } else if (field.type === 'email') {
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return NextResponse.json(
              { success: false, error: 'Please enter a valid email address' },
              { status: 400 }
            );
          }
          processedData[field.id] = value;
        } else if (field.type === 'phone') {
          // Clean phone number
          processedData[field.id] = value.replace(/[^\d+()-\s]/g, '');
        } else {
          processedData[field.id] = value;
        }
      }
    });

    // Extract contact information for potential contact creation
    const emailFieldId = findFieldByType(formFields, 'email');
    const nameFieldId = findFieldByType(formFields, 'text') || 
                        findFieldByLabel(formFields, ['name', 'full name', 'your name']);
    const phoneFieldId = findFieldByType(formFields, 'phone');
    
    const email = emailFieldId ? processedData[emailFieldId] : null;
    const name = nameFieldId ? processedData[nameFieldId] : null;
    const phone = phoneFieldId ? processedData[phoneFieldId] : null;

    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: processedData
      }
    });

    // Create or update contact if email is provided
    if (email) {
      try {
        const existingContact = await prisma.contact.findFirst({
          where: {
            email: email,
            tenantId: form.tenantId
          }
        });

        if (existingContact) {
          // Update existing contact with new information
          await prisma.contact.update({
            where: { id: existingContact.id },
            data: {
              firstName: name || existingContact.firstName,
              phone: phone || existingContact.phone,
              notes: existingContact.notes ? 
                `${existingContact.notes}\n\nForm submission: ${JSON.stringify(processedData)}` :
                `Form submission: ${JSON.stringify(processedData)}`
            }
          });
        } else {
          // Create new contact
          await prisma.contact.create({
            data: {
              tenantId: form.tenantId,
              firstName: name || 'Unknown',
              email: email,
              phone: phone || null,
              source: `Form: ${form.title}`,
              notes: `Form submission: ${JSON.stringify(processedData)}`
            }
          });
        }
      } catch (contactError) {
        console.error('Error creating/updating contact:', contactError);
        // Don't fail the submission if contact creation fails
      }
    }

    // Trigger workflows for form submission
    try {
      await triggerWorkflows.formSubmitted(submission, form.tenantId);
    } catch (workflowError) {
      console.error('Error triggering workflows for form submission:', workflowError);
      // Don't fail the form submission if workflow triggers fail
    }

    return NextResponse.json({
      success: true,
      message: form.successMessage || 'Thank you for your submission!',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Helper functions
function findFieldByType(fields: FormField[], type: string): string | undefined {
  const field = fields.find(f => f.type === type);
  return field?.id;
}

function findFieldByLabel(fields: FormField[], labels: string[]): string | undefined {
  const field = fields.find(f => 
    labels.some(label => 
      f.label.toLowerCase().includes(label.toLowerCase())
    )
  );
  return field?.id;
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
} 