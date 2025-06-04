import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { formId, submissionData } = data;

    if (!formId || !submissionData) {
      return NextResponse.json({ error: 'Form ID and submission data are required' }, { status: 400 });
    }

    // Get the form to check if it exists and is active
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.isActive) {
      return NextResponse.json({ error: 'Form is not active' }, { status: 400 });
    }

    // Create the form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: formId,
        data: submissionData,
      },
    });

    // Check if we should create a contact from this submission
    const fields = form.fields as any[];
    const hasContactFields = fields.some(field => 
      ['email', 'phone', 'text'].includes(field.type) && 
      ['email', 'phone', 'name', 'firstName', 'lastName'].some(keyword => 
        field.label.toLowerCase().includes(keyword) || 
        field.name?.toLowerCase().includes(keyword)
      )
    );

    if (hasContactFields) {
      // Extract contact information from submission
      const contactData: any = {
        tenantId: form.tenantId,
        status: 'LEAD',
        source: `Form: ${form.title}`,
      };

      // Look for email field
      const emailField = fields.find(field => 
        field.type === 'email' || 
        field.label.toLowerCase().includes('email') ||
        field.name?.toLowerCase().includes('email')
      );
      if (emailField && submissionData[emailField.id]) {
        contactData.email = submissionData[emailField.id];
      }

      // Look for phone field
      const phoneField = fields.find(field => 
        field.type === 'phone' || 
        field.label.toLowerCase().includes('phone') ||
        field.name?.toLowerCase().includes('phone')
      );
      if (phoneField && submissionData[phoneField.id]) {
        contactData.phone = submissionData[phoneField.id];
      }

      // Look for name fields
      const nameField = fields.find(field => 
        field.label.toLowerCase().includes('name') && 
        !field.label.toLowerCase().includes('company')
      );
      const firstNameField = fields.find(field => 
        field.label.toLowerCase().includes('first name') ||
        field.name?.toLowerCase().includes('firstname')
      );
      const lastNameField = fields.find(field => 
        field.label.toLowerCase().includes('last name') ||
        field.name?.toLowerCase().includes('lastname')
      );

      if (firstNameField && submissionData[firstNameField.id]) {
        contactData.firstName = submissionData[firstNameField.id];
      } else if (nameField && submissionData[nameField.id]) {
        // Split full name into first and last
        const fullName = submissionData[nameField.id].trim();
        const nameParts = fullName.split(' ');
        contactData.firstName = nameParts[0];
        if (nameParts.length > 1) {
          contactData.lastName = nameParts.slice(1).join(' ');
        }
      } else {
        contactData.firstName = 'Unknown';
      }

      if (lastNameField && submissionData[lastNameField.id]) {
        contactData.lastName = submissionData[lastNameField.id];
      }

      // Check if contact with this email already exists
      if (contactData.email) {
        const existingContact = await prisma.contact.findFirst({
          where: {
            tenantId: form.tenantId,
            email: contactData.email,
          },
        });

        if (!existingContact) {
          // Create new contact
          await prisma.contact.create({
            data: contactData,
          });
        } else {
          // Update existing contact with new information
          const updateData: any = {};
          if (!existingContact.phone && contactData.phone) {
            updateData.phone = contactData.phone;
          }
          if (Object.keys(updateData).length > 0) {
            await prisma.contact.update({
              where: { id: existingContact.id },
              data: updateData,
            });
          }
        }
      } else if (contactData.phone) {
        // If no email but has phone, check by phone
        const existingContact = await prisma.contact.findFirst({
          where: {
            tenantId: form.tenantId,
            phone: contactData.phone,
          },
        });

        if (!existingContact) {
          await prisma.contact.create({
            data: contactData,
          });
        }
      } else {
        // Create contact even without email/phone if we have a name
        if (contactData.firstName && contactData.firstName !== 'Unknown') {
          await prisma.contact.create({
            data: contactData,
          });
        }
      }
    }

    // Return appropriate response based on form settings
    const responseData: any = {
      success: true,
      submissionId: submission.id,
    };

    if (form.successMessage) {
      responseData.message = form.successMessage;
    }

    if (form.redirectUrl) {
      responseData.redirectUrl = form.redirectUrl;
    }

    // Add CORS headers
    const response = NextResponse.json(responseData, { status: 201 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error processing form submission:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}

export async function OPTIONS() {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Get total count
    const total = await prisma.formSubmission.count({
      where: { formId: formId },
    });

    // Get submissions with pagination
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: formId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get form details to understand field structure
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { fields: true, title: true },
    });

    return NextResponse.json({
      submissions,
      form: form,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 