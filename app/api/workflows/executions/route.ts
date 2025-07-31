import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      workflow: {
        tenantId: user.tenantId,
      },
    };

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.workflowExecution.count({ where });

    // Get executions with related data
    const executions = await prisma.workflowExecution.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        logs: {
          orderBy: { startedAt: 'asc' },
          select: {
            id: true,
            status: true,
            actionName: true,
            actionType: true,
            startedAt: true,
            completedAt: true,
            result: true,
            error: true,
          },
        },
      },
    });

    return NextResponse.json({
      executions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 