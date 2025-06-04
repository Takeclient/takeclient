import { prisma } from '@/lib/prisma';
import { 
  Workflow, 
  WorkflowAction, 
  WorkflowExecution,
  WorkflowExecutionLog,
  Contact,
  Deal,
  Company,
  User
} from '@prisma/client';

export class WorkflowExecutor {
  private workflow: Workflow;
  private execution: WorkflowExecution;

  constructor(workflow: Workflow, execution: WorkflowExecution) {
    this.workflow = workflow;
    this.execution = execution;
  }

  async execute() {
    try {
      console.log(`Starting workflow execution: ${this.workflow.name}`);

      // Update execution status to running
      await prisma.workflowExecution.update({
        where: { id: this.execution.id },
        data: { status: 'RUNNING' },
      });

      // Get all actions for this workflow
      const actions = await prisma.workflowAction.findMany({
        where: { workflowId: this.workflow.id },
        orderBy: { order: 'asc' },
      });

      // Execute each action in order
      for (const action of actions) {
        const success = await this.executeAction(action);
        
        if (!success) {
          // Stop execution if an action fails
          await prisma.workflowExecution.update({
            where: { id: this.execution.id },
            data: { 
              status: 'FAILED',
              completedAt: new Date(),
              error: `Action ${action.name} failed`,
            },
          });
          return;
        }

        // Wait if there's a delay configured
        if (action.delayMinutes) {
          await this.delay(action.delayMinutes * 60 * 1000);
        }
      }

      // Mark execution as completed
      await prisma.workflowExecution.update({
        where: { id: this.execution.id },
        data: { 
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      console.log(`Workflow execution completed: ${this.workflow.name}`);
    } catch (error) {
      console.error('Workflow execution error:', error);
      await prisma.workflowExecution.update({
        where: { id: this.execution.id },
        data: { 
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          errorDetails: error as any,
        },
      });
    }
  }

  private async executeAction(action: WorkflowAction): Promise<boolean> {
    const log = await prisma.workflowExecutionLog.create({
      data: {
        status: 'RUNNING',
        actionName: action.name,
        actionType: action.type,
        actionConfig: action.config,
        executionId: this.execution.id,
        actionId: action.id,
      },
    });

    try {
      let result: any;

      switch (action.type) {
        // Contact Actions
        case 'UPDATE_CONTACT':
          result = await this.updateContact(action.config);
          break;
        case 'UPDATE_CONTACT_STAGE':
          result = await this.updateContactStage(action.config);
          break;
        case 'ADD_CONTACT_TAG':
          result = await this.addContactTag(action.config);
          break;
        case 'UPDATE_CONTACT_SCORE':
          result = await this.updateContactScore(action.config);
          break;
        case 'ASSIGN_CONTACT':
          result = await this.assignContact(action.config);
          break;

        // Deal Actions
        case 'CREATE_DEAL':
          result = await this.createDeal(action.config);
          break;
        case 'UPDATE_DEAL':
          result = await this.updateDeal(action.config);
          break;
        case 'UPDATE_DEAL_STAGE':
          result = await this.updateDealStage(action.config);
          break;

        // Task Actions
        case 'CREATE_TASK':
          result = await this.createTask(action.config);
          break;

        // Communication Actions
        case 'SEND_EMAIL':
          result = await this.sendEmail(action.config);
          break;
        case 'SEND_WHATSAPP':
          result = await this.sendWhatsApp(action.config);
          break;
        case 'SEND_NOTIFICATION':
          result = await this.sendNotification(action.config);
          break;

        // Control Flow
        case 'WAIT':
          result = await this.wait(action.config);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      await prisma.workflowExecutionLog.update({
        where: { id: log.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          result: result || null,
        },
      });

      return true;
    } catch (error) {
      await prisma.workflowExecutionLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          errorDetails: error as any,
        },
      });

      return false;
    }
  }

  // Helper methods for different action types

  private async updateContact(config: any) {
    const contact = await prisma.contact.findUnique({
      where: { id: this.execution.entityId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const updateData: any = {};
    
    if (config.fields) {
      Object.entries(config.fields).forEach(([field, value]) => {
        updateData[field] = value;
      });
    }

    return await prisma.contact.update({
      where: { id: contact.id },
      data: updateData,
    });
  }

  private async updateContactStage(config: any) {
    const contact = await prisma.contact.findUnique({
      where: { id: this.execution.entityId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Update contact stage
    await prisma.contact.update({
      where: { id: contact.id },
      data: { stageId: config.stageId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE',
        title: 'Stage Changed',
        description: `Contact stage changed to ${config.stageName || 'new stage'}`,
        contactId: contact.id,
        tenantId: contact.tenantId,
        userId: contact.assignedTo || this.execution.userId,
      },
    });

    return { success: true };
  }

  private async addContactTag(config: any) {
    const contact = await prisma.contact.findUnique({
      where: { id: this.execution.entityId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const currentTags = contact.tags || [];
    const newTags = [...new Set([...currentTags, ...config.tags])];

    return await prisma.contact.update({
      where: { id: contact.id },
      data: { tags: newTags },
    });
  }

  private async updateContactScore(config: any) {
    const contact = await prisma.contact.findUnique({
      where: { id: this.execution.entityId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const currentScore = contact.leadScore || 0;
    let newScore = currentScore;

    if (config.operation === 'add') {
      newScore = currentScore + config.value;
    } else if (config.operation === 'subtract') {
      newScore = Math.max(0, currentScore - config.value);
    } else if (config.operation === 'set') {
      newScore = config.value;
    }

    return await prisma.contact.update({
      where: { id: contact.id },
      data: { leadScore: newScore },
    });
  }

  private async assignContact(config: any) {
    return await prisma.contact.update({
      where: { id: this.execution.entityId },
      data: { assignedTo: config.userId },
    });
  }

  private async createDeal(config: any) {
    const contact = await prisma.contact.findUnique({
      where: { id: this.execution.entityId },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return await prisma.deal.create({
      data: {
        name: config.name || `Deal for ${contact.firstName} ${contact.lastName || ''}`.trim(),
        value: config.value || 0,
        tenantId: contact.tenantId,
        contactId: contact.id,
        companyId: contact.companyId,
        assignedTo: config.assignedToId || contact.assignedTo,
        stage: config.stage || 'PROSPECTING',
        closeDate: config.expectedCloseDate ? new Date(config.expectedCloseDate) : undefined,
      },
    });
  }

  private async updateDeal(config: any) {
    const updateData: any = {};
    
    if (config.fields) {
      Object.entries(config.fields).forEach(([field, value]) => {
        updateData[field] = value;
      });
    }

    return await prisma.deal.update({
      where: { id: config.dealId || this.execution.entityId },
      data: updateData,
    });
  }

  private async updateDealStage(config: any) {
    const deal = await prisma.deal.findUnique({
      where: { id: config.dealId || this.execution.entityId },
    });

    if (!deal) {
      throw new Error('Deal not found');
    }

    return await prisma.deal.update({
      where: { id: deal.id },
      data: { stage: config.stage },
    });
  }

  private async createTask(config: any) {
    const entityData: any = {};
    
    if (this.execution.entityType === 'contact') {
      entityData.contactId = this.execution.entityId;
    } else if (this.execution.entityType === 'deal') {
      entityData.dealId = this.execution.entityId;
    } else if (this.execution.entityType === 'company') {
      entityData.companyId = this.execution.entityId;
    }

    const entity = await prisma[this.execution.entityType as 'contact' | 'deal' | 'company'].findUnique({
      where: { id: this.execution.entityId },
    });

    if (!entity) {
      throw new Error(`${this.execution.entityType} not found`);
    }

    return await prisma.task.create({
      data: {
        title: config.title,
        description: config.description,
        priority: config.priority || 'MEDIUM',
        dueDate: config.dueDate ? new Date(config.dueDate) : undefined,
        assignedToId: config.assignedToId,
        tenantId: (entity as any).tenantId,
        ...entityData,
      },
    });
  }

  private async sendEmail(config: any) {
    // TODO: Integrate with email service
    console.log('Sending email:', config);
    
    // For now, just log the activity
    const entity = await prisma[this.execution.entityType as 'contact' | 'deal' | 'company'].findUnique({
      where: { id: this.execution.entityId },
    });

    if (entity && this.execution.entityType === 'contact') {
      await prisma.activity.create({
        data: {
          type: 'EMAIL',
          description: `Sent email: ${config.subject}`,
          contactId: this.execution.entityId,
          tenantId: (entity as any).tenantId,
          metadata: {
            subject: config.subject,
            template: config.templateId,
          },
        },
      });
    }

    return { success: true, message: 'Email queued for sending' };
  }

  private async sendWhatsApp(config: any) {
    // TODO: Integrate with WhatsApp API
    console.log('Sending WhatsApp:', config);
    
    return { success: true, message: 'WhatsApp message queued for sending' };
  }

  private async sendNotification(config: any) {
    // TODO: Implement internal notification system
    console.log('Sending notification:', config);
    
    return { success: true, message: 'Notification sent' };
  }

  private async wait(config: any) {
    const minutes = config.minutes || 0;
    const milliseconds = minutes * 60 * 1000;
    
    if (milliseconds > 0) {
      await this.delay(milliseconds);
    }
    
    return { success: true, waitedMinutes: minutes };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Trigger handler - this will be called when events happen in the system
export async function triggerWorkflow(
  triggerType: string,
  entityType: string,
  entityId: string,
  tenantId: string,
  triggerData?: any
) {
  try {
    // Find all active workflows for this trigger type and tenant
    const workflows = await prisma.workflow.findMany({
      where: {
        tenantId,
        triggerType,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    for (const workflow of workflows) {
      // Check if workflow should run
      if (!workflow.allowMultipleRuns) {
        const existingExecution = await prisma.workflowExecution.findFirst({
          where: {
            workflowId: workflow.id,
            entityType,
            entityId,
            status: { in: ['COMPLETED', 'RUNNING'] },
          },
        });

        if (existingExecution) {
          console.log(`Skipping workflow ${workflow.name} - already ran for this entity`);
          continue;
        }
      }

      // Check max runs
      if (workflow.maxRuns) {
        const runCount = await prisma.workflowExecution.count({
          where: {
            workflowId: workflow.id,
            entityType,
            entityId,
          },
        });

        if (runCount >= workflow.maxRuns) {
          console.log(`Skipping workflow ${workflow.name} - max runs reached`);
          continue;
        }
      }

      // Check conditions
      if (workflow.conditions) {
        // TODO: Implement condition evaluation
        console.log('Checking workflow conditions...');
      }

      // Create execution record
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          entityType,
          entityId,
          triggerType,
          triggerData,
          status: 'PENDING',
        },
      });

      // Execute workflow asynchronously
      const executor = new WorkflowExecutor(workflow, execution);
      executor.execute().catch(error => {
        console.error(`Error executing workflow ${workflow.name}:`, error);
      });
    }
  } catch (error) {
    console.error('Error triggering workflows:', error);
  }
} 