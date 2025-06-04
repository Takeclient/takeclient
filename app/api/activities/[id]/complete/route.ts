import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // Check if activity exists and belongs to tenant
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const activity = await prisma.activity.update({
      where: { id: id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error completing activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 