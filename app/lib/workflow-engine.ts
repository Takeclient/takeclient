import { prisma } from './prisma';
import { WorkflowTriggerType, WorkflowActionType, ExecutionStatus } from '@prisma/client';

export interface TriggerEvent {
  type: WorkflowTriggerType;
  entityId: string;
  entityType: string;
  tenantId: string;
  data: any;
  userId?: string;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  tenantId: string;
  entityId: string;
  entityType: string;
  triggerData: any;
  variables: Record<string, any>;
}

export class WorkflowEngine {
  /**
   * Process a trigger event and start workflows
   */
  static async processTrigger(event: TriggerEvent): Promise<void> {
    console.log(`[WorkflowEngine] Processing trigger: ${event.type} for ${event.entityType}:${event.entityId}`);

    try {
      // Find active workflows for this trigger type
      const workflows = await prisma.workflow.findMany({
        where: {
          tenantId: event.tenantId,
          triggerType: event.type,
          isActive: true,
          status: 'ACTIVE',
        },
        include: {
          actions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      console.log(`[WorkflowEngine] Found ${workflows.length} active workflows for trigger ${event.type}`);

      // Process each workflow
      for (const workflow of workflows) {
        await this.startWorkflowExecution(workflow, event);
      }
    } catch (error) {
      console.error('[WorkflowEngine] Error processing trigger:', error);
      throw error;
    }
  }

  /**
   * Start execution of a specific workflow
   */
  static async startWorkflowExecution(workflow: any, event: TriggerEvent): Promise<string> {
    console.log(`[WorkflowEngine] Starting workflow execution: ${workflow.name} (${workflow.id})`);

    try {
      // Check if workflow conditions are met
      if (workflow.conditions && !this.evaluateConditions(workflow.conditions, event)) {
        console.log(`[WorkflowEngine] Workflow conditions not met for ${workflow.id}`);
        return '';
      }

      // Create workflow execution record
      const execution = await prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          status: ExecutionStatus.RUNNING,
          entityType: event.entityType,
          entityId: event.entityId,
          triggerType: event.type,
          triggerData: event.data,
        },
      });

      console.log(`[WorkflowEngine] Created execution ${execution.id} for workflow ${workflow.id}`);

      // Start processing actions asynchronously
      this.executeWorkflowActions(execution.id, workflow, event).catch((error) => {
        console.error(`[WorkflowEngine] Error executing workflow ${workflow.id}:`, error);
        this.markExecutionFailed(execution.id, error.message);
      });

      return execution.id;
    } catch (error) {
      console.error('[WorkflowEngine] Error starting workflow execution:', error);
      throw error;
    }
  }

  /**
   * Execute all actions in a workflow
   */
  static async executeWorkflowActions(executionId: string, workflow: any, event: TriggerEvent): Promise<void> {
    console.log(`[WorkflowEngine] Executing actions for workflow ${workflow.id}`);

    const context: ExecutionContext = {
      workflowId: workflow.id,
      executionId,
      tenantId: event.tenantId,
      entityId: event.entityId,
      entityType: event.entityType,
      triggerData: event.data,
      variables: {},
    };

    try {
      // Execute actions in order
      for (const action of workflow.actions) {
        await this.executeAction(action, context);
      }

      // Mark execution as completed
      await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: ExecutionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      console.log(`[WorkflowEngine] Workflow execution ${executionId} completed successfully`);
    } catch (error: any) {
      console.error(`[WorkflowEngine] Error executing workflow actions:`, error);
      await this.markExecutionFailed(executionId, error.message || 'Unknown error');
      throw error;
    }
  }

  /**
   * Execute a single action
   */
  static async executeAction(action: any, context: ExecutionContext): Promise<void> {
    console.log(`[WorkflowEngine] Executing action: ${action.name} (${action.type})`);

    // Create action execution log
    const logEntry = await prisma.workflowExecutionLog.create({
      data: {
        executionId: context.executionId,
        actionId: action.id,
        status: ExecutionStatus.RUNNING,
        actionName: action.name,
        actionType: action.type,
        actionConfig: action.config,
      },
    });

    try {
      // Handle delay if specified
      if (action.delayMinutes && action.delayMinutes > 0) {
        console.log(`[WorkflowEngine] Delaying action ${action.name} for ${action.delayMinutes} minutes`);
        // In production, this would be handled by a job queue
        await new Promise(resolve => setTimeout(resolve, action.delayMinutes * 60 * 1000));
      }

      // Execute the action based on its type
      const result = await this.executeActionByType(action.type, action.config, context);

      // Update log with success
      await prisma.workflowExecutionLog.update({
        where: { id: logEntry.id },
        data: {
          status: ExecutionStatus.COMPLETED,
          completedAt: new Date(),
          result,
        },
      });

      console.log(`[WorkflowEngine] Action ${action.name} completed successfully`);
    } catch (error: any) {
      console.error(`[WorkflowEngine] Error executing action ${action.name}:`, error);

      // Update log with error
      await prisma.workflowExecutionLog.update({
        where: { id: logEntry.id },
        data: {
          status: ExecutionStatus.FAILED,
          completedAt: new Date(),
          error: error.message || 'Unknown error',
          errorDetails: { stack: error.stack },
        },
      });

      throw error;
    }
  }

  /**
   * Execute action based on its type
   */
  static async executeActionByType(
    actionType: WorkflowActionType,
    config: any,
    context: ExecutionContext
  ): Promise<any> {
    console.log(`[WorkflowEngine] Executing action type: ${actionType}`);

    switch (actionType) {
      // CRM Actions
      case 'UPDATE_CONTACT':
        return await this.updateContact(config, context);
      case 'UPDATE_CONTACT_STAGE':
        return await this.updateContactStage(config, context);
      case 'ADD_CONTACT_TAG':
        return await this.addContactTag(config, context);
      case 'UPDATE_CONTACT_SCORE':
        return await this.updateContactScore(config, context);
      case 'CREATE_DEAL':
        return await this.createDeal(config, context);
      case 'CREATE_TASK':
        return await this.createTask(config, context);
      case 'CREATE_ACTIVITY':
        return await this.createActivity(config, context);
      case 'ASSIGN_CONTACT':
        return await this.assignContact(config, context);

      // Communication Actions
      case 'SEND_EMAIL':
        return await this.sendEmail(config, context);
      case 'SEND_NOTIFICATION':
        return await this.sendNotification(config, context);

      // Control Flow
      case 'WAIT':
        return await this.waitAction(config, context);

      default:
        console.warn(`[WorkflowEngine] Unknown action type: ${actionType}`);
        return { status: 'skipped', reason: 'Unknown action type' };
    }
  }

  /**
   * CRM Action Implementations
   */
  static async updateContact(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Updating contact ${context.entityId}`);

    const updateData: any = {};

    // Handle different update types
    if (config.updateFields) {
      Object.assign(updateData, config.updateFields);
    }

    if (config.addTags && Array.isArray(config.addTags)) {
      // Get current contact to merge tags
      const contact = await prisma.contact.findUnique({
        where: { id: context.entityId },
        select: { tags: true },
      });

      if (contact) {
        const existingTags = contact.tags || [];
        const newTags = [...new Set([...existingTags, ...config.addTags])];
        updateData.tags = newTags;
      }
    }

    if (config.leadScore !== undefined) {
      updateData.leadScore = config.leadScore;
    }

    const updatedContact = await prisma.contact.update({
      where: { id: context.entityId },
      data: updateData,
    });

    return { contactId: updatedContact.id, updated: Object.keys(updateData) };
  }

  static async updateContactStage(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Updating contact stage for ${context.entityId}`);

    const contact = await prisma.contact.update({
      where: { id: context.entityId },
      data: {
        stageId: config.stageId,
      },
    });

    return { contactId: contact.id, newStageId: config.stageId };
  }

  static async addContactTag(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Adding tag to contact ${context.entityId}`);

    const contact = await prisma.contact.findUnique({
      where: { id: context.entityId },
      select: { tags: true },
    });

    if (contact) {
      const existingTags = contact.tags || [];
      const newTags = [...new Set([...existingTags, config.tag])];

      await prisma.contact.update({
        where: { id: context.entityId },
        data: { tags: newTags },
      });
    }

    return { contactId: context.entityId, tag: config.tag };
  }

  static async updateContactScore(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Updating contact score for ${context.entityId}`);

    const contact = await prisma.contact.findUnique({
      where: { id: context.entityId },
      select: { leadScore: true },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    let newScore = contact.leadScore || 0;

    switch (config.operation) {
      case 'add':
        newScore += config.value || 0;
        break;
      case 'subtract':
        newScore -= config.value || 0;
        break;
      case 'set':
        newScore = config.value || 0;
        break;
      case 'multiply':
        newScore *= config.value || 1;
        break;
    }

    // Ensure score doesn't go below 0
    newScore = Math.max(0, newScore);

    const updatedContact = await prisma.contact.update({
      where: { id: context.entityId },
      data: { leadScore: newScore },
    });

    return { contactId: updatedContact.id, oldScore: contact.leadScore, newScore };
  }

  static async createDeal(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Creating deal for contact ${context.entityId}`);

    const contact = await prisma.contact.findUnique({
      where: { id: context.entityId },
      select: { firstName: true, lastName: true, companyId: true },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const deal = await prisma.deal.create({
      data: {
        name: config.dealName || `Opportunity - ${contact.firstName} ${contact.lastName}`,
        value: config.estimatedValue || 0,
        stage: config.stage || 'PROSPECTING',
        probability: config.probability || 0,
        description: config.description || 'Auto-generated from workflow',
        contactId: context.entityId,
        companyId: contact.companyId,
        tenantId: context.tenantId,
        assignedTo: config.assignedTo,
      },
    });

    return { dealId: deal.id, contactId: context.entityId };
  }

  static async createTask(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Creating task for ${context.entityType} ${context.entityId}`);

    // Get a user to assign the task to (default to first admin user)
    const assignee = await prisma.user.findFirst({
      where: {
        tenantId: context.tenantId,
        isActive: true,
        role: { in: ['TENANT_ADMIN', 'MANAGER', 'SALES'] },
      },
    });

    if (!assignee) {
      throw new Error('No available user to assign task to');
    }

    const task = await prisma.task.create({
      data: {
        title: config.title || 'Workflow generated task',
        description: config.description || 'Auto-generated from workflow',
        priority: config.priority || 'MEDIUM',
        dueDate: config.dueInDays ? new Date(Date.now() + config.dueInDays * 24 * 60 * 60 * 1000) : null,
        assignedTo: config.assignedTo || assignee.id,
        assignedBy: assignee.id,
        tenantId: context.tenantId,
        contactId: context.entityType === 'contact' ? context.entityId : null,
        dealId: context.entityType === 'deal' ? context.entityId : null,
        companyId: context.entityType === 'company' ? context.entityId : null,
      },
    });

    return { taskId: task.id, assignedTo: task.assignedTo };
  }

  static async createActivity(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Creating activity for ${context.entityType} ${context.entityId}`);

    // Get a user to associate the activity with
    const user = await prisma.user.findFirst({
      where: {
        tenantId: context.tenantId,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('No available user to associate activity with');
    }

    const activity = await prisma.activity.create({
      data: {
        type: config.type || 'OTHER',
        title: config.title || 'Workflow activity',
        description: config.description || 'Auto-generated from workflow',
        isCompleted: true,
        completedAt: new Date(),
        userId: user.id,
        tenantId: context.tenantId,
        contactId: context.entityType === 'contact' ? context.entityId : null,
        dealId: context.entityType === 'deal' ? context.entityId : null,
        companyId: context.entityType === 'company' ? context.entityId : null,
      },
    });

    return { activityId: activity.id };
  }

  static async assignContact(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Assigning contact ${context.entityId}`);

    let assigneeId = config.assignedTo;

    // Handle assignment rules
    if (config.assignmentRule) {
      switch (config.assignmentRule) {
        case 'round-robin':
          // Simple round-robin: get users and assign to next in line
          const users = await prisma.user.findMany({
            where: {
              tenantId: context.tenantId,
              isActive: true,
              role: { in: ['TENANT_ADMIN', 'MANAGER', 'SALES'] },
            },
            orderBy: { createdAt: 'asc' },
          });

          if (users.length > 0) {
            // Simple implementation: use user count to determine assignment
            const contactCount = await prisma.contact.count({
              where: { tenantId: context.tenantId },
            });
            assigneeId = users[contactCount % users.length].id;
          }
          break;

        case 'load-balanced':
          // Assign to user with least contacts
          const userWithLeastContacts = await prisma.user.findFirst({
            where: {
              tenantId: context.tenantId,
              isActive: true,
              role: { in: ['TENANT_ADMIN', 'MANAGER', 'SALES'] },
            },
            include: {
              _count: {
                select: { ownedContacts: true },
              },
            },
            orderBy: {
              ownedContacts: { _count: 'asc' },
            },
          });

          if (userWithLeastContacts) {
            assigneeId = userWithLeastContacts.id;
          }
          break;
      }
    }

    if (assigneeId) {
      await prisma.contact.update({
        where: { id: context.entityId },
        data: { assignedTo: assigneeId },
      });
    }

    return { contactId: context.entityId, assignedTo: assigneeId };
  }

  /**
   * Communication Actions
   */
  static async sendEmail(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Sending email to contact ${context.entityId}`);

    // Get contact email
    const contact = await prisma.contact.findUnique({
      where: { id: context.entityId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!contact || !contact.email) {
      throw new Error('Contact email not found');
    }

    // In a real implementation, this would integrate with your email service
    console.log(`[WorkflowEngine] Would send email to ${contact.email}`);
    console.log(`Subject: ${config.subject}`);
    console.log(`Template: ${config.templateId}`);

    // Create email record (mock)
    const emailRecord = {
      to: contact.email,
      subject: config.subject,
      template: config.templateId,
      sentAt: new Date(),
      status: 'sent',
    };

    return emailRecord;
  }

  static async sendNotification(config: any, context: ExecutionContext): Promise<any> {
    console.log(`[WorkflowEngine] Sending notification: ${config.message}`);

    // In a real implementation, this would send notifications to users
    console.log(`Recipients: ${config.recipientRole}`);
    console.log(`Channels: ${config.channels?.join(', ')}`);

    return { sent: true, message: config.message };
  }

  /**
   * Control Flow Actions
   */
  static async waitAction(config: any, context: ExecutionContext): Promise<any> {
    const delayMs = (config.delay || 1) * (config.unit === 'hours' ? 3600000 : config.unit === 'days' ? 86400000 : 60000);
    console.log(`[WorkflowEngine] Waiting for ${delayMs}ms`);

    // In production, this would be handled by a job queue
    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 5000))); // Cap at 5 seconds for demo

    return { waited: delayMs };
  }

  /**
   * Helper methods
   */
  static evaluateConditions(conditions: any, event: TriggerEvent): boolean {
    // Simple condition evaluation - can be extended
    if (!conditions || typeof conditions !== 'object') {
      return true;
    }

    // Check form-specific conditions
    if (event.type === 'FORM_SUBMITTED') {
      if (conditions.formIds && Array.isArray(conditions.formIds)) {
        const formId = event.data.formId;
        if (!conditions.formIds.includes(formId)) {
          console.log(`[WorkflowEngine] Form ${formId} not in allowed forms:`, conditions.formIds);
          return false;
        }
      }
    }

    // Check WhatsApp message conditions
    if (event.type === 'WHATSAPP_MESSAGE_RECEIVED') {
      if (conditions.phoneNumbers && Array.isArray(conditions.phoneNumbers)) {
        const phoneNumber = event.data.phoneNumber;
        if (!conditions.phoneNumbers.includes(phoneNumber)) {
          console.log(`[WorkflowEngine] Phone number ${phoneNumber} not in allowed numbers`);
          return false;
        }
      }
      
      if (conditions.messageKeywords && Array.isArray(conditions.messageKeywords)) {
        const messageText = event.data.messageText?.toLowerCase() || '';
        const hasKeyword = conditions.messageKeywords.some((keyword: string) =>
          messageText.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) {
          console.log(`[WorkflowEngine] Message does not contain required keywords`);
          return false;
        }
      }
    }

    // Check email opened conditions
    if (event.type === 'EMAIL_OPENED') {
      if (conditions.campaignIds && Array.isArray(conditions.campaignIds)) {
        const campaignId = event.data.campaignId;
        if (!conditions.campaignIds.includes(campaignId)) {
          console.log(`[WorkflowEngine] Campaign ${campaignId} not in allowed campaigns`);
          return false;
        }
      }
    }

    // Check trigger-specific conditions
    if (conditions.source && event.data.source !== conditions.source) {
      return false;
    }

    if (conditions.requiredTags && Array.isArray(conditions.requiredTags)) {
      const entityTags = event.data.tags || [];
      const hasRequiredTags = conditions.requiredTags.every((tag: string) => 
        entityTags.includes(tag)
      );
      if (!hasRequiredTags) {
        return false;
      }
    }

    return true;
  }

  static async markExecutionFailed(executionId: string, error: string): Promise<void> {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        completedAt: new Date(),
        error,
      },
    });
  }
} 