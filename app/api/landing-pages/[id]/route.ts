import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Validation schema
const updatePageSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  content: z.array(z.object({
    id: z.string(),
    componentId: z.string(),
    props: z.any(),
  })).optional(),
  css: z.string().optional().nullable(),
  javascript: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  status: z.string().optional(),
  publishedAt: z.string().optional().nullable(),
  // Allow additional fields from the database/frontend
  ogImage: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  analytics: z.any().optional().nullable(),
  publishedBy: z.string().optional(),
  views: z.number().optional(),
  uniqueVisitors: z.number().optional(),
  conversionRate: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  tenantId: z.string().optional(),
  createdById: z.string().optional(),
  template: z.any().optional().nullable(),
  _count: z.any().optional(),
  id: z.string().optional(),
}).passthrough();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const page = await prisma.landingPage.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        template: true,
        _count: {
          select: {
            submissions: true,
            pageAnalytics: true,
            versions: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updatePageSchema.parse(body);

    // Check if page exists and belongs to tenant
    const existingPage = await prisma.landingPage.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Check if slug is being changed and already exists
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.landingPage.findFirst({
        where: {
          tenantId: session.user.tenantId,
          slug: validatedData.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
      }
    }

    // Check if custom domain is being changed and already in use
    if (validatedData.customDomain !== undefined && validatedData.customDomain !== existingPage.customDomain) {
      if (validatedData.customDomain) {
        const domainInUse = await prisma.landingPage.findFirst({
          where: {
            customDomain: validatedData.customDomain,
            id: { not: id },
          },
        });

        if (domainInUse) {
          return NextResponse.json({ error: 'This domain is already in use' }, { status: 400 });
        }
      }
    }

    // Create a version before updating
    const currentVersion = await prisma.pageVersion.count({
      where: { pageId: id },
    });

    await prisma.pageVersion.create({
      data: {
        pageId: id,
        version: currentVersion + 1,
        content: existingPage.content as any,
        createdBy: session.user.id,
      },
    });

    // Only update the fields that are valid for the database
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Add only the fields that exist and are valid for database updates
    // Convert null to undefined for fields that shouldn't be null
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.content !== undefined) updateData.content = validatedData.content;
    if (validatedData.css !== undefined) updateData.css = validatedData.css;
    if (validatedData.javascript !== undefined) updateData.javascript = validatedData.javascript;
    if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle;
    if (validatedData.metaDescription !== undefined) updateData.metaDescription = validatedData.metaDescription;
    if (validatedData.metaKeywords !== undefined) updateData.metaKeywords = validatedData.metaKeywords;
    if (validatedData.customDomain !== undefined) updateData.customDomain = validatedData.customDomain;
    if (validatedData.templateId !== undefined) updateData.templateId = validatedData.templateId;
    
    // Additional fields that can be updated
    if (validatedData.ogImage !== undefined) updateData.ogImage = validatedData.ogImage;
    if (validatedData.ogTitle !== undefined) updateData.ogTitle = validatedData.ogTitle;
    if (validatedData.ogDescription !== undefined) updateData.ogDescription = validatedData.ogDescription;
    if (validatedData.favicon !== undefined) updateData.favicon = validatedData.favicon;
    if (validatedData.analytics !== undefined) updateData.analytics = validatedData.analytics;

    // Update the page
    const updatedPage = await prisma.landingPage.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
      },
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('Error updating landing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if page exists and belongs to tenant
    const existingPage = await prisma.landingPage.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Delete the page (cascading deletes will handle related records)
    await prisma.landingPage.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_TENANT',
        resource: 'LandingPage',
        resourceId: id,
        metadata: {
          pageName: existingPage.name,
          pageSlug: existingPage.slug,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ message: 'Landing page deleted successfully' });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 