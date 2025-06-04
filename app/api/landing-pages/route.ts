import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Validation schema
const createPageSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  content: z.array(z.object({
    id: z.string(),
    componentId: z.string(),
    props: z.any(),
  })).default([]),
  css: z.string().optional(),
  javascript: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  customDomain: z.string().optional(),
  templateId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.landingPage.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              submissions: true,
              pageAnalytics: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.landingPage.count({ where }),
    ]);

    return NextResponse.json({
      pages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received landing page creation request:', body);
    
    // Validate the request data
    let validatedData;
    try {
      validatedData = createPageSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Invalid request data', 
          details: validationError.errors 
        }, { status: 400 });
      }
      throw validationError;
    }

    console.log('Validated data:', validatedData);

    // Check if slug already exists
    const existingPage = await prisma.landingPage.findFirst({
      where: {
        tenantId: session.user.tenantId,
        slug: validatedData.slug,
      },
    });

    if (existingPage) {
      console.error('Slug already exists:', validatedData.slug);
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
    }

    // Check if custom domain is already in use
    if (validatedData.customDomain) {
      const domainInUse = await prisma.landingPage.findFirst({
        where: {
          customDomain: validatedData.customDomain,
        },
      });

      if (domainInUse) {
        console.error('Custom domain already in use:', validatedData.customDomain);
        return NextResponse.json({ error: 'This domain is already in use' }, { status: 400 });
      }
    }

    console.log('Creating landing page with data:', {
      ...validatedData,
      tenantId: session.user.tenantId,
      createdById: session.user.id,
    });

    // Create the landing page
    const page = await prisma.landingPage.create({
      data: {
        ...validatedData,
        content: validatedData.content as any,
        // Don't store templateId for hardcoded templates since they don't exist in the database
        templateId: null,
        tenantId: session.user.tenantId,
        createdById: session.user.id,
      },
      include: {
        template: true,
      },
    });

    console.log('Landing page created successfully:', page.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'LandingPage',
        resourceId: page.id,
        metadata: {
          pageName: page.name,
          pageSlug: page.slug,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('Error creating landing page:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    
    // Check for specific Prisma errors
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ 
        error: 'A unique constraint violation occurred. Please check your slug or domain.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred'
    }, { status: 500 });
  }
} 