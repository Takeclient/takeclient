import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the original page
    const originalPage = await prisma.landingPage.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!originalPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Generate a unique slug for the duplicate
    let newSlug = `${originalPage.slug}-copy`;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const existingPage = await prisma.landingPage.findFirst({
        where: {
          tenantId: session.user.tenantId,
          slug: newSlug,
        },
      });

      if (!existingPage) {
        slugExists = false;
      } else {
        counter++;
        newSlug = `${originalPage.slug}-copy-${counter}`;
      }
    }

    // Create the duplicate
    const duplicatedPage = await prisma.landingPage.create({
      data: {
        name: `${originalPage.name} (Copy)`,
        slug: newSlug,
        description: originalPage.description,
        status: 'DRAFT',
        content: originalPage.content as any,
        css: originalPage.css,
        javascript: originalPage.javascript,
        metaTitle: originalPage.metaTitle,
        metaDescription: originalPage.metaDescription,
        metaKeywords: originalPage.metaKeywords,
        // Don't copy custom domain
        templateId: originalPage.templateId,
        tenantId: session.user.tenantId,
        createdById: session.user.id,
      },
      include: {
        template: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'LandingPage',
        resourceId: duplicatedPage.id,
        metadata: {
          pageName: duplicatedPage.name,
          duplicatedFrom: originalPage.id,
          originalPageName: originalPage.name,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({
      message: 'Landing page duplicated successfully',
      page: duplicatedPage,
    });
  } catch (error) {
    console.error('Error duplicating landing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 