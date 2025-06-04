import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const { id: workflowId } = await context.params;

    // Check if workflow exists and belongs to tenant
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        tenantId: user.tenantId,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Toggle the active status
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: { 
        isActive: !workflow.isActive,
        status: !workflow.isActive ? 'ACTIVE' : 'PAUSED',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_TENANT',
        resource: 'Workflow',
        resourceId: workflow.id,
        metadata: {
          workflowName: workflow.name,
          previousStatus: workflow.isActive,
          newStatus: updatedWorkflow.isActive,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({ 
      workflow: updatedWorkflow,
      message: updatedWorkflow.isActive ? 'Workflow activated' : 'Workflow paused',
    });
  } catch (error) {
    console.error('Error toggling workflow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle workflow' },
      { status: 500 }
    );
  }
} 