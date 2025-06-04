import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import { WorkflowActionType } from '@prisma/client';

// Validation schema for updating a workflow
const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  triggerType: z.enum([
    'CONTACT_CREATED', 'CONTACT_UPDATED', 'CONTACT_STAGE_CHANGED', 'CONTACT_TAG_ADDED', 'CONTACT_SCORE_CHANGED',
    'DEAL_CREATED', 'DEAL_UPDATED', 'DEAL_STAGE_CHANGED', 'DEAL_WON', 'DEAL_LOST',
    'COMPANY_CREATED', 'COMPANY_UPDATED',
    'FORM_SUBMITTED',
    'EMAIL_OPENED', 'EMAIL_CLICKED', 'EMAIL_BOUNCED', 'EMAIL_UNSUBSCRIBED',
    'WHATSAPP_MESSAGE_RECEIVED', 'WHATSAPP_MESSAGE_SENT', 'WHATSAPP_CONVERSATION_STARTED',
    'TIME_BASED', 'RECURRING',
    'ACTIVITY_COMPLETED', 'TASK_CREATED', 'TASK_COMPLETED', 'TASK_OVERDUE',
    'WEBHOOK', 'API_CALL'
  ]).optional(),
  triggerConfig: z.any().optional(),
  conditions: z.any().optional(),
  isActive: z.boolean().optional(),
  allowMultipleRuns: z.boolean().optional(),
  maxRuns: z.number().optional(),
  steps: z.array(z.object({
    type: z.string(),
    config: z.any(),
    order: z.number(),
  })).optional(),
  metadata: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await params before using
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Get workflow with actions
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: id, // Use the awaited id
        tenantId: user.tenantId,
      },
      include: {
        actions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params; // Await params before using
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Check if user has permission to update workflows
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if workflow exists and belongs to tenant
    const existingWorkflow = await prisma.workflow.findFirst({
      where: {
        id: id, // Use the awaited id
        tenantId: user.tenantId,
      },
    });

    if (!existingWorkflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateWorkflowSchema.parse(body);

    // Update workflow in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Store visual workflow metadata in triggerConfig
      const enhancedTriggerConfig = validatedData.triggerConfig ? {
        ...validatedData.triggerConfig,
        visualWorkflowMetadata: validatedData.metadata,
      } : undefined;

      // Update workflow
      const workflow = await tx.workflow.update({
        where: { id: id }, // Use the awaited id
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.description !== undefined && { description: validatedData.description }),
          ...(validatedData.triggerType && { triggerType: validatedData.triggerType as any }),
          ...(enhancedTriggerConfig && { triggerConfig: enhancedTriggerConfig }),
          ...(validatedData.conditions !== undefined && { conditions: validatedData.conditions }),
          ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
          ...(validatedData.allowMultipleRuns !== undefined && { allowMultipleRuns: validatedData.allowMultipleRuns }),
          ...(validatedData.maxRuns !== undefined && { maxRuns: validatedData.maxRuns }),
        },
      });

      // Update workflow actions if steps are provided
      if (validatedData.steps) {
        // Delete existing actions
        await tx.workflowAction.deleteMany({
          where: { workflowId: id }, // Use the awaited id
        });

        // Create new actions
        if (validatedData.steps.length > 0) {
          const actionPromises = validatedData.steps.map((step) => {
            return tx.workflowAction.create({
              data: {
                name: `Step ${step.order}`,
                type: mapActionType(step.type),
                config: step.config,
                order: step.order,
                workflowId: id, // Use the awaited id
              },
            });
          });
          
          await Promise.all(actionPromises);
        }
      }

      return workflow;
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_TENANT', // Using existing AuditAction enum value
          resource: 'Workflow',
          resourceId: result.id,
          metadata: {
            workflowName: result.name,
            action: 'updated',
          },
          userId: user.id,
          tenantId: user.tenantId!,
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the main request if audit logging fails
    }

    return NextResponse.json({ 
      workflow: result,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// Helper function to map visual workflow action types to database enum values
function mapActionType(actionType: string): WorkflowActionType {
  const actionMap: Record<string, WorkflowActionType> = {
    'SEND_EMAIL': 'SEND_EMAIL',
    'SEND_WHATSAPP': 'SEND_WHATSAPP',
    'UPDATE_CONTACT': 'UPDATE_CONTACT',
    'UPDATE_CONTACT_STAGE': 'UPDATE_CONTACT_STAGE',
    'ADD_CONTACT_TAG': 'ADD_CONTACT_TAG',
    'UPDATE_CONTACT_SCORE': 'UPDATE_CONTACT_SCORE',
    'ASSIGN_CONTACT': 'ASSIGN_CONTACT',
    'CREATE_DEAL': 'CREATE_DEAL',
    'CREATE_TASK': 'CREATE_TASK',
    'CREATE_ACTIVITY': 'CREATE_ACTIVITY',
    'SEND_NOTIFICATION': 'SEND_NOTIFICATION',
    'WAIT': 'WAIT',
    'BRANCH_CONDITION': 'BRANCH_CONDITION',
  };

  return actionMap[actionType] || 'UPDATE_CONTACT'; // Default fallback
} 