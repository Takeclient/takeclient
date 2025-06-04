import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    
    // Extract form ID from embed code format if necessary
    const cleanFormId = formId.replace('crm-form-', '');
    
    // Get form data (public endpoint, no auth required)
    const form = await prisma.form.findUnique({
      where: { id: cleanFormId },
      select: {
        id: true,
        title: true,
        description: true,
        fields: true,
        styles: true,
        buttonStyle: true,
        submitText: true,
        successMessage: true,
        redirectUrl: true,
        isActive: true,
      }
    });
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    // Add CORS headers for embedding on external sites
    const response = NextResponse.json(form);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error fetching public form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  // Handle preflight requests
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
} 