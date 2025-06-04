import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { FormSchema } from '@/app/models/form';
import { checkPlanLimit } from '@/app/lib/plan-limits';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const tenantId = (session.user as any)?.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Check plan limits before creating form
    const formLimitCheck = await checkPlanLimit(tenantId, 'contacts', 1); // Using contacts as proxy for forms
    if (!formLimitCheck.allowed) {
      return NextResponse.json({ 
        error: formLimitCheck.message || 'Form limit exceeded',
        code: 'PLAN_LIMIT_EXCEEDED',
        details: {
          currentCount: formLimitCheck.currentUsage,
          limit: formLimitCheck.limit
        }
      }, { status: 403 });
    }

    const data = await req.json();
    
    // Validate form data with Zod schema
    const result = FormSchema.safeParse({
      ...data,
      tenantId,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid form data', details: result.error.format() }, { status: 400 });
    }

    const formData = result.data;
    
    // Save form to database first to get the ID
    const savedForm = await prisma.form.create({
      data: {
        title: formData.title,
        description: formData.description,
        fields: formData.fields,
        styles: formData.styles || {},
        buttonStyle: formData.buttonStyle || {},
        submitText: formData.submitText || 'Submit',
        successMessage: formData.successMessage,
        redirectUrl: formData.redirectUrl,
        isActive: formData.isActive ?? true,
        embedCode: '', // Placeholder, will be updated
        createdBy: userId,
        tenantId: tenantId,
      },
    });

    // Generate embed code with the actual form ID
    const embedCode = generateEmbedCode(savedForm.id);

    // Update form with the embed code
    const updatedForm = await prisma.form.update({
      where: { id: savedForm.id },
      data: { embedCode }
    });

    return NextResponse.json({ form: updatedForm }, { status: 201 });
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Get search params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    
    // Build where clause
    const where: any = {
      tenantId: tenantId,
    };
    
    // Apply search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Get total count
    const total = await prisma.form.count({ where });
    
    // Get forms with pagination
    const forms = await prisma.form.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return NextResponse.json({
      forms,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Check if form exists and belongs to tenant
    const existingForm = await prisma.form.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Update form
    const updatedForm = await prisma.form.update({
      where: { id: id },
      data: {
        title: updateData.title,
        description: updateData.description,
        fields: updateData.fields,
        styles: updateData.styles,
        buttonStyle: updateData.buttonStyle,
        submitText: updateData.submitText,
        successMessage: updateData.successMessage,
        redirectUrl: updateData.redirectUrl,
        isActive: updateData.isActive,
      },
    });

    return NextResponse.json({ form: updatedForm }, { status: 200 });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // Check if form exists and belongs to tenant
    const existingForm = await prisma.form.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Delete form (submissions will be cascade deleted)
    await prisma.form.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Form deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate embed code
function generateEmbedCode(formId: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  // Generate unique container ID
  const containerId = `crm-form-${formId}`;
  
  // Create multiple embed options
  const embedOptions = {
    // Standard embed
    standard: `<!-- CRM Pro Form Embed - Standard -->
<div id="${containerId}" class="crm-form-embed"></div>
<script async src="${baseUrl}/api/embed/${formId}?theme=light"></script>`,

    // Dark theme
    dark: `<!-- CRM Pro Form Embed - Dark Theme -->
<div id="${containerId}" class="crm-form-embed"></div>
<script async src="${baseUrl}/api/embed/${formId}?theme=dark"></script>`,

    // Minimal theme
    minimal: `<!-- CRM Pro Form Embed - Minimal -->
<div id="${containerId}" class="crm-form-embed"></div>
<script async src="${baseUrl}/api/embed/${formId}?theme=minimal"></script>`,

    // WordPress shortcode
    wordpress: `<!-- WordPress Shortcode -->
[crm_form id="${formId}" theme="light"]`,

    // React/Next.js
    react: `/* React/Next.js Component */
import { useEffect } from 'react';

export default function CRMForm() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/embed/${formId}?theme=light';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="${containerId}" className="crm-form-embed" />;
}`,

    // Direct HTML
    html: `<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
</head>
<body>
    <div id="${containerId}" class="crm-form-embed"></div>
    <script async src="${baseUrl}/api/embed/${formId}?theme=light"></script>
</body>
</html>`
  };

  // Return JSON string with all options
  return JSON.stringify({
    formId,
    embedUrl: `${baseUrl}/api/embed/${formId}`,
    containerId,
    options: embedOptions,
    instructions: {
      standard: "Copy and paste this code into any HTML page where you want the form to appear.",
      wordpress: "For WordPress sites, you can use this shortcode in posts or pages.",
      react: "For React/Next.js applications, use this component code.",
      customization: `You can customize the theme by changing the theme parameter: light, dark, or minimal.
Example: ${baseUrl}/api/embed/${formId}?theme=dark`
    }
  });
}
