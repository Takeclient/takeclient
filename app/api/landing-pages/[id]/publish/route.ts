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

    // Check if page exists and belongs to tenant
    const page = await prisma.landingPage.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 });
    }

    // Update the page status to published
    const updatedPage = await prisma.landingPage.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedBy: session.user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TENANT',
        resource: 'LandingPage',
        resourceId: id,
        metadata: {
          pageName: page.name,
          action: 'published',
          previousStatus: page.status,
        },
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ 
      message: 'Landing page published successfully',
      page: updatedPage,
    });
  } catch (error) {
    console.error('Error publishing landing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 