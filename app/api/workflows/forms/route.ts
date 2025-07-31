import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

/**
 * Get available forms for workflow trigger configuration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // Get all active forms for this tenant
    const forms = await prisma.form.findMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json({
      forms: forms.map(form => ({
        id: form.id,
        name: form.title,
        description: form.description,
        submissionCount: form._count.submissions,
        createdAt: form.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching forms for workflow configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 