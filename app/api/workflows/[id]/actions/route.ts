import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating an action
const createActionSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'UPDATE_CONTACT', 'UPDATE_CONTACT_STAGE', 'ADD_CONTACT_TAG', 'REMOVE_CONTACT_TAG', 
    'UPDATE_CONTACT_SCORE', 'ASSIGN_CONTACT',
    'CREATE_DEAL', 'UPDATE_DEAL', 'UPDATE_DEAL_STAGE', 'ASSIGN_DEAL',
    'UPDATE_COMPANY', 'ASSIGN_COMPANY',
    'CREATE_TASK', 'UPDATE_TASK', 'ASSIGN_TASK',
    'CREATE_ACTIVITY',
    'SEND_EMAIL', 'ADD_TO_EMAIL_LIST', 'REMOVE_FROM_EMAIL_LIST', 'UPDATE_EMAIL_SUBSCRIPTION',
    'SEND_WHATSAPP', 'SEND_WHATSAPP_TEMPLATE',
    'SEND_NOTIFICATION', 'SEND_SLACK_MESSAGE',
    'UPDATE_FIELD', 'CALCULATE_FIELD',
    'WAIT', 'BRANCH_CONDITION',
    'WEBHOOK', 'API_REQUEST',
    'RUN_WORKFLOW', 'STOP_WORKFLOW'
  ]),
  config: z.any(),
  order: z.number(),
  delayMinutes: z.number().optional(),
  conditions: z.any().optional(),
});

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

    const body = await request.json();
    const validatedData = createActionSchema.parse(body);

    // Create action
    const action = await prisma.workflowAction.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        config: validatedData.config,
        order: validatedData.order,
        delayMinutes: validatedData.delayMinutes,
        conditions: validatedData.conditions,
        workflow: { connect: { id: workflowId } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'WorkflowAction',
        resourceId: action.id,
        metadata: {
          workflowId,
          actionName: action.name,
          actionType: action.type,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({ action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating workflow action:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow action' },
      { status: 500 }
    );
  }
} 