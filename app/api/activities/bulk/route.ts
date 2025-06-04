import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
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

    const body = await req.json();
    const { activityIds, action } = body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return NextResponse.json(
        { error: 'Activity IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Verify all activities belong to the tenant
    const activities = await prisma.activity.findMany({
      where: {
        id: { in: activityIds },
        tenantId: user.tenantId,
      },
    });

    if (activities.length !== activityIds.length) {
      return NextResponse.json(
        { error: 'Some activities not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'complete':
        updateData = {
          isCompleted: true,
          completedAt: new Date(),
        };
        break;
      case 'incomplete':
        updateData = {
          isCompleted: false,
          completedAt: null,
        };
        break;
      case 'delete':
        await prisma.activity.deleteMany({
          where: {
            id: { in: activityIds },
            tenantId: user.tenantId,
          },
        });
        return NextResponse.json({ 
          message: `${activityIds.length} activities deleted successfully` 
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await prisma.activity.updateMany({
      where: {
        id: { in: activityIds },
        tenantId: user.tenantId,
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `${result.count} activities updated successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk activity operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 