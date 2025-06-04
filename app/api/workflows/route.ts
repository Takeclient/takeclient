import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import { WorkflowActionType } from '@prisma/client';
import { checkPlanLimit } from '@/app/lib/plan-limits';

// Validation schema for creating a workflow
const createWorkflowSchema = z.object({
  name: z.string().min(1),
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
  ]),
  triggerConfig: z.any(),
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

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const triggerType = searchParams.get('triggerType');

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (triggerType) {
      where.triggerType = triggerType;
    }

    // Get workflows with counts and recent stats
    const workflows = await prisma.workflow.findMany({
      where,
      include: {
        _count: {
          select: {
            actions: true,
            executions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get execution stats for each workflow
    const workflowsWithStats = await Promise.all(
      workflows.map(async (workflow) => {
        const stats = await prisma.workflowExecution.aggregate({
          where: { workflowId: workflow.id },
          _count: {
            _all: true,
          },
        });

        const successfulRuns = await prisma.workflowExecution.count({
          where: {
            workflowId: workflow.id,
            status: 'COMPLETED',
          },
        });

        const failedRuns = await prisma.workflowExecution.count({
          where: {
            workflowId: workflow.id,
            status: 'FAILED',
          },
        });

        const lastExecution = await prisma.workflowExecution.findFirst({
          where: { workflowId: workflow.id },
          orderBy: { startedAt: 'desc' },
          select: { startedAt: true },
        });

        return {
          ...workflow,
          stats: {
            totalRuns: stats._count._all,
            successfulRuns,
            failedRuns,
            lastRun: lastExecution?.startedAt,
          },
        };
      })
    );

    return NextResponse.json({ workflows: workflowsWithStats });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/workflows - Starting workflow creation');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', { hasSession: !!session, userEmail: session?.user?.email });
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized - Please log in to create workflows' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: { include: { plan: true } } },
    });

    if (!user?.tenantId) {
      console.log('No user or tenantId found for email:', session.user.email);
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    console.log('User found:', { id: user.id, tenantId: user.tenantId, role: user.role, planName: user.tenant?.plan?.name });

    // Check if user has permission to create workflows
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(user.role)) {
      console.log('Insufficient permissions for role:', user.role);
      return NextResponse.json({ error: 'Insufficient permissions to create workflows' }, { status: 403 });
    }

    // Check plan limits for automations
    console.log('Checking plan limits for automations...');
    const planCheck = await checkPlanLimit(user.tenantId, 'automations', 1);
    console.log('Plan check result:', planCheck);
    
    if (!planCheck.allowed) {
      console.log('Plan limit exceeded:', planCheck.message);
      return NextResponse.json({ 
        error: 'Plan Limit Exceeded', 
        message: planCheck.message || 'You have reached your workflow automation limit. Please upgrade your plan to create more workflows.',
        planLimitReached: true,
        currentUsage: planCheck.currentUsage,
        limit: planCheck.limit
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    const validatedData = createWorkflowSchema.parse(body);
    console.log('Data validated successfully');

    // Create workflow in a transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting database transaction');
      
      // Store visual workflow metadata in triggerConfig
      const enhancedTriggerConfig = {
        ...validatedData.triggerConfig,
        visualWorkflowMetadata: validatedData.metadata,
      };

      console.log('Creating workflow with enhanced config');
      
      // Create workflow
      const workflow = await tx.workflow.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          triggerType: validatedData.triggerType as any,
          triggerConfig: enhancedTriggerConfig,
          conditions: validatedData.conditions,
          isActive: validatedData.isActive ?? false,
          status: 'DRAFT',
          allowMultipleRuns: validatedData.allowMultipleRuns ?? true,
          maxRuns: validatedData.maxRuns,
          tenant: { connect: { id: user.tenantId! } },
        },
      });

      console.log('Workflow created with ID:', workflow.id);

      // Create workflow actions if steps are provided
      if (validatedData.steps && validatedData.steps.length > 0) {
        console.log('Creating workflow actions:', validatedData.steps.length);
        
        const actionPromises = validatedData.steps.map((step, index) => {
          console.log(`Creating action ${index + 1}:`, step);
          return tx.workflowAction.create({
            data: {
              name: `Step ${step.order}`,
              type: mapActionType(step.type),
              config: step.config,
              order: step.order,
              workflowId: workflow.id,
            },
          });
        });
        
        await Promise.all(actionPromises);
        console.log('All workflow actions created');
      }

      return workflow;
    });

    console.log('Transaction completed successfully');

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_TENANT', // Using existing AuditAction enum value
          resource: 'Workflow',
          resourceId: result.id,
          metadata: {
            workflowName: result.name,
            triggerType: result.triggerType,
            stepCount: validatedData.steps?.length || 0,
          },
          userId: user.id,
          tenantId: user.tenantId!,
        },
      });
      console.log('Audit log created');
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the main request if audit logging fails
    }

    console.log('Workflow creation completed successfully');
    return NextResponse.json({ 
      workflow: result,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/workflows:', error);
    
    if (error instanceof z.ZodError) {
      console.log('Validation error details:', error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error creating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create workflow', details: error instanceof Error ? error.message : 'Unknown error' },
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