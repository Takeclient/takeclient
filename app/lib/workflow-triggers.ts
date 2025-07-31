import { WorkflowEngine, TriggerEvent } from './workflow-engine';
import { WorkflowTriggerType } from '@prisma/client';

/**
 * Workflow Trigger System
 * Monitors CRM events and triggers workflows
 */
export class WorkflowTriggers {
  /**
   * Trigger workflow when a contact is created
   */
  static async onContactCreated(contact: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Contact created: ${contact.id}`);

    const event: TriggerEvent = {
      type: 'CONTACT_CREATED' as WorkflowTriggerType,
      entityId: contact.id,
      entityType: 'contact',
      tenantId,
      data: {
        contact,
        source: contact.source,
        tags: contact.tags,
        leadScore: contact.leadScore,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        companyId: contact.companyId,
        stageId: contact.stageId,
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a contact is updated
   */
  static async onContactUpdated(
    oldContact: any, 
    newContact: any, 
    tenantId: string, 
    userId?: string
  ): Promise<void> {
    console.log(`[WorkflowTriggers] Contact updated: ${newContact.id}`);

    // Check if stage changed
    if (oldContact.stageId !== newContact.stageId) {
      await this.onContactStageChanged(oldContact, newContact, tenantId, userId);
    }

    // Check if score changed significantly (more than 10 points)
    if (Math.abs((oldContact.leadScore || 0) - (newContact.leadScore || 0)) >= 10) {
      await this.onContactScoreChanged(oldContact, newContact, tenantId, userId);
    }

    // General update trigger
    const event: TriggerEvent = {
      type: 'CONTACT_UPDATED' as WorkflowTriggerType,
      entityId: newContact.id,
      entityType: 'contact',
      tenantId,
      data: {
        oldContact,
        newContact,
        changes: this.getChangedFields(oldContact, newContact),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when contact stage changes
   */
  static async onContactStageChanged(
    oldContact: any, 
    newContact: any, 
    tenantId: string, 
    userId?: string
  ): Promise<void> {
    console.log(`[WorkflowTriggers] Contact stage changed: ${newContact.id} (${oldContact.stageId} -> ${newContact.stageId})`);

    const event: TriggerEvent = {
      type: 'CONTACT_STAGE_CHANGED' as WorkflowTriggerType,
      entityId: newContact.id,
      entityType: 'contact',
      tenantId,
      data: {
        contact: newContact,
        oldStageId: oldContact.stageId,
        newStageId: newContact.stageId,
        direction: this.getStageDirection(oldContact.stageId, newContact.stageId),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when contact score changes
   */
  static async onContactScoreChanged(
    oldContact: any, 
    newContact: any, 
    tenantId: string, 
    userId?: string
  ): Promise<void> {
    console.log(`[WorkflowTriggers] Contact score changed: ${newContact.id} (${oldContact.leadScore} -> ${newContact.leadScore})`);

    const event: TriggerEvent = {
      type: 'CONTACT_SCORE_CHANGED' as WorkflowTriggerType,
      entityId: newContact.id,
      entityType: 'contact',
      tenantId,
      data: {
        contact: newContact,
        oldScore: oldContact.leadScore || 0,
        newScore: newContact.leadScore || 0,
        change: (newContact.leadScore || 0) - (oldContact.leadScore || 0),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a deal is created
   */
  static async onDealCreated(deal: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Deal created: ${deal.id}`);

    const event: TriggerEvent = {
      type: 'DEAL_CREATED' as WorkflowTriggerType,
      entityId: deal.id,
      entityType: 'deal',
      tenantId,
      data: {
        deal,
        value: deal.value,
        stage: deal.stage,
        contactId: deal.contactId,
        companyId: deal.companyId,
        assignedTo: deal.assignedTo,
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a deal is updated
   */
  static async onDealUpdated(
    oldDeal: any, 
    newDeal: any, 
    tenantId: string, 
    userId?: string
  ): Promise<void> {
    console.log(`[WorkflowTriggers] Deal updated: ${newDeal.id}`);

    // Check if stage changed
    if (oldDeal.stage !== newDeal.stage) {
      await this.onDealStageChanged(oldDeal, newDeal, tenantId, userId);
    }

    // Check if deal was won
    if (newDeal.stage === 'CLOSED_WON' && oldDeal.stage !== 'CLOSED_WON') {
      await this.onDealWon(newDeal, tenantId, userId);
    }

    // Check if deal was lost
    if (newDeal.stage === 'CLOSED_LOST' && oldDeal.stage !== 'CLOSED_LOST') {
      await this.onDealLost(newDeal, tenantId, userId);
    }

    // General update trigger
    const event: TriggerEvent = {
      type: 'DEAL_UPDATED' as WorkflowTriggerType,
      entityId: newDeal.id,
      entityType: 'deal',
      tenantId,
      data: {
        oldDeal,
        newDeal,
        changes: this.getChangedFields(oldDeal, newDeal),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when deal stage changes
   */
  static async onDealStageChanged(
    oldDeal: any, 
    newDeal: any, 
    tenantId: string, 
    userId?: string
  ): Promise<void> {
    console.log(`[WorkflowTriggers] Deal stage changed: ${newDeal.id} (${oldDeal.stage} -> ${newDeal.stage})`);

    const event: TriggerEvent = {
      type: 'DEAL_STAGE_CHANGED' as WorkflowTriggerType,
      entityId: newDeal.id,
      entityType: 'deal',
      tenantId,
      data: {
        deal: newDeal,
        oldStage: oldDeal.stage,
        newStage: newDeal.stage,
        value: newDeal.value,
        contactId: newDeal.contactId,
        companyId: newDeal.companyId,
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a deal is won
   */
  static async onDealWon(deal: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Deal won: ${deal.id} - Value: ${deal.value}`);

    const event: TriggerEvent = {
      type: 'DEAL_WON' as WorkflowTriggerType,
      entityId: deal.id,
      entityType: 'deal',
      tenantId,
      data: {
        deal,
        value: deal.value,
        contactId: deal.contactId,
        companyId: deal.companyId,
        closeDate: new Date(),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a deal is lost
   */
  static async onDealLost(deal: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Deal lost: ${deal.id} - Value: ${deal.value}`);

    const event: TriggerEvent = {
      type: 'DEAL_LOST' as WorkflowTriggerType,
      entityId: deal.id,
      entityType: 'deal',
      tenantId,
      data: {
        deal,
        value: deal.value,
        contactId: deal.contactId,
        companyId: deal.companyId,
        lostDate: new Date(),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a company is created
   */
  static async onCompanyCreated(company: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Company created: ${company.id}`);

    const event: TriggerEvent = {
      type: 'COMPANY_CREATED' as WorkflowTriggerType,
      entityId: company.id,
      entityType: 'company',
      tenantId,
      data: {
        company,
        name: company.name,
        industry: company.industry,
        size: company.size,
        revenue: company.revenue,
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a task is completed
   */
  static async onTaskCompleted(task: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Task completed: ${task.id}`);

    const event: TriggerEvent = {
      type: 'TASK_COMPLETED' as WorkflowTriggerType,
      entityId: task.id,
      entityType: 'task',
      tenantId,
      data: {
        task,
        title: task.title,
        contactId: task.contactId,
        dealId: task.dealId,
        companyId: task.companyId,
        completedAt: new Date(),
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when an activity is completed
   */
  static async onActivityCompleted(activity: any, tenantId: string, userId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Activity completed: ${activity.id}`);

    const event: TriggerEvent = {
      type: 'ACTIVITY_COMPLETED' as WorkflowTriggerType,
      entityId: activity.id,
      entityType: 'activity',
      tenantId,
      data: {
        activity,
        type: activity.type,
        title: activity.title,
        contactId: activity.contactId,
        dealId: activity.dealId,
        companyId: activity.companyId,
        completedAt: activity.completedAt,
      },
      userId,
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a form is submitted
   */
  static async onFormSubmitted(submission: any, tenantId: string): Promise<void> {
    console.log(`[WorkflowTriggers] Form submitted: ${submission.id} from form: ${submission.formId}`);

    const event: TriggerEvent = {
      type: 'FORM_SUBMITTED' as WorkflowTriggerType,
      entityId: submission.id,
      entityType: 'form_submission',
      tenantId,
      data: {
        submission,
        formId: submission.formId,
        submissionData: submission.data,
        email: submission.data?.email,
        source: 'form',
      },
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when a WhatsApp message is received
   */
  static async onWhatsAppMessageReceived(message: any, tenantId: string, contactId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] WhatsApp message received: ${message.id}`);

    const event: TriggerEvent = {
      type: 'WHATSAPP_MESSAGE_RECEIVED' as WorkflowTriggerType,
      entityId: message.id,
      entityType: 'whatsapp_message',
      tenantId,
      data: {
        message,
        contactId,
        messageText: message.text,
        phoneNumber: message.from,
        messageType: message.type,
        source: 'whatsapp',
      },
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Trigger workflow when an email is opened
   */
  static async onEmailOpened(emailEvent: any, tenantId: string, contactId?: string): Promise<void> {
    console.log(`[WorkflowTriggers] Email opened: ${emailEvent.id}`);

    const event: TriggerEvent = {
      type: 'EMAIL_OPENED' as WorkflowTriggerType,
      entityId: emailEvent.id,
      entityType: 'email_event',
      tenantId,
      data: {
        emailEvent,
        contactId,
        emailId: emailEvent.emailId,
        campaignId: emailEvent.campaignId,
        openedAt: emailEvent.openedAt,
        source: 'email',
      },
    };

    await WorkflowEngine.processTrigger(event);
  }

  /**
   * Helper methods
   */
  private static getChangedFields(oldObject: any, newObject: any): string[] {
    const changes: string[] = [];
    const keys = new Set([...Object.keys(oldObject || {}), ...Object.keys(newObject || {})]);

    for (const key of keys) {
      if (oldObject[key] !== newObject[key]) {
        changes.push(key);
      }
    }

    return changes;
  }

  private static getStageDirection(oldStageId: string | null, newStageId: string | null): 'forward' | 'backward' | 'unknown' {
    // Simple stage direction logic - can be enhanced with actual stage order
    if (!oldStageId || !newStageId) return 'unknown';
    
    // This would normally use actual pipeline stage order
    const stageOrder = ['lead', 'qualified', 'opportunity', 'negotiation', 'customer'];
    const oldIndex = stageOrder.indexOf(oldStageId);
    const newIndex = stageOrder.indexOf(newStageId);
    
    if (oldIndex === -1 || newIndex === -1) return 'unknown';
    
    return newIndex > oldIndex ? 'forward' : 'backward';
  }
}

/**
 * Convenient trigger functions for use in API routes
 */
export const triggerWorkflows = {
  contactCreated: WorkflowTriggers.onContactCreated,
  contactUpdated: WorkflowTriggers.onContactUpdated,
  contactStageChanged: WorkflowTriggers.onContactStageChanged,
  dealCreated: WorkflowTriggers.onDealCreated,
  dealUpdated: WorkflowTriggers.onDealUpdated,
  dealStageChanged: WorkflowTriggers.onDealStageChanged,
  dealWon: WorkflowTriggers.onDealWon,
  dealLost: WorkflowTriggers.onDealLost,
  companyCreated: WorkflowTriggers.onCompanyCreated,
  taskCompleted: WorkflowTriggers.onTaskCompleted,
  activityCompleted: WorkflowTriggers.onActivityCompleted,
  formSubmitted: WorkflowTriggers.onFormSubmitted,
  whatsappMessageReceived: WorkflowTriggers.onWhatsAppMessageReceived,
  emailOpened: WorkflowTriggers.onEmailOpened,
}; 