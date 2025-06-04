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
    const { taskIds, action } = body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Task IDs are required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Verify all tasks belong to the tenant
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        tenantId: user.tenantId,
      },
    });

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'Some tasks not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'complete':
        updateData = {
          status: 'COMPLETED',
          completedAt: new Date(),
        };
        break;
      case 'in_progress':
        updateData = {
          status: 'IN_PROGRESS',
        };
        break;
      case 'pending':
        updateData = {
          status: 'PENDING',
          completedAt: null,
        };
        break;
      case 'cancel':
        updateData = {
          status: 'CANCELLED',
        };
        break;
      case 'delete':
        await prisma.task.deleteMany({
          where: {
            id: { in: taskIds },
            tenantId: user.tenantId,
          },
        });
        return NextResponse.json({ 
          message: `${taskIds.length} tasks deleted successfully` 
        });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        tenantId: user.tenantId,
      },
      data: updateData,
    });

    return NextResponse.json({
      message: `${result.count} tasks updated successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk task operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 