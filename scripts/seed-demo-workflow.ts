import { PrismaClient, WorkflowActionType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoWorkflow() {
  try {
    console.log('🌱 Seeding demo workflow...');

    // Get the first tenant (Sample Company)
    const tenant = await prisma.tenant.findFirst({
      where: {
        name: 'Sample Company'
      }
    });

    if (!tenant) {
      console.log('❌ No tenant found. Please run the sample data seeder first.');
      return;
    }

    console.log(`📋 Found tenant: ${tenant.name} (${tenant.id})`);

    // Create a demo workflow for contact creation
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Welcome New Contacts',
        description: 'Automatically welcome new contacts and assign them to sales team',
        status: 'ACTIVE',
        triggerType: 'CONTACT_CREATED',
        triggerConfig: {
          filterBySource: false,
          sources: ['website', 'form', 'manual'],
        },
        conditions: undefined,
        isActive: true,
        allowMultipleRuns: true,
        tenantId: tenant.id,
      },
    });

    console.log(`✅ Created workflow: ${workflow.name} (${workflow.id})`);

    // Create workflow actions
    const actions = [
      {
        name: 'Add Welcome Tag',
        type: 'ADD_CONTACT_TAG' as WorkflowActionType,
        config: {
          tag: 'new-contact',
        },
        order: 1,
      },
      {
        name: 'Increase Lead Score',
        type: 'UPDATE_CONTACT_SCORE' as WorkflowActionType,
        config: {
          operation: 'add',
          value: 10,
        },
        order: 2,
      },
      {
        name: 'Create Welcome Task',
        type: 'CREATE_TASK' as WorkflowActionType,
        config: {
          title: 'Welcome new contact: {{contact.firstName}} {{contact.lastName}}',
          description: 'Reach out to welcome the new contact and understand their needs',
          priority: 'MEDIUM',
          dueInDays: 1,
        },
        order: 3,
      },
      {
        name: 'Log Welcome Activity',
        type: 'CREATE_ACTIVITY' as WorkflowActionType,
        config: {
          type: 'NOTE',
          title: 'Contact added to system',
          description: 'New contact automatically processed by welcome workflow',
        },
        order: 4,
      },
    ];

    for (const actionData of actions) {
      const action = await prisma.workflowAction.create({
        data: {
          ...actionData,
          workflowId: workflow.id,
        },
      });
      console.log(`  ✅ Created action: ${action.name}`);
    }

    // Create another workflow for deal creation
    const dealWorkflow = await prisma.workflow.create({
      data: {
        name: 'New Deal Notification',
        description: 'Notify team when high-value deals are created',
        status: 'ACTIVE',
        triggerType: 'DEAL_CREATED',
        triggerConfig: {
          minValue: 5000, // Only trigger for deals over $50
        },
        conditions: {
          dealValue: {
            operator: 'greater_than',
            value: 5000,
          },
        },
        isActive: true,
        allowMultipleRuns: true,
        tenantId: tenant.id,
      },
    });

    console.log(`✅ Created workflow: ${dealWorkflow.name} (${dealWorkflow.id})`);

    const dealActions = [
      {
        name: 'Send Team Notification',
        type: 'SEND_NOTIFICATION' as WorkflowActionType,
        config: {
          recipientRole: 'sales_manager',
          message: 'High-value deal created: {{deal.name}} - ${{deal.value}}',
          channels: ['email', 'in-app'],
        },
        order: 1,
      },
      {
        name: 'Create Follow-up Task',
        type: 'CREATE_TASK' as WorkflowActionType,
        config: {
          title: 'Follow up on high-value deal: {{deal.name}}',
          description: 'Priority follow-up for deal worth ${{deal.value}}',
          priority: 'HIGH',
          dueInDays: 1,
        },
        order: 2,
      },
    ];

    for (const actionData of dealActions) {
      const action = await prisma.workflowAction.create({
        data: {
          ...actionData,
          workflowId: dealWorkflow.id,
        },
      });
      console.log(`  ✅ Created action: ${action.name}`);
    }

    console.log('🎉 Demo workflows created successfully!');
    console.log('');
    console.log('📝 To test the workflows:');
    console.log('1. Create a new contact in the CRM');
    console.log('2. Create a new deal with value > $50');
    console.log('3. Check the workflow executions page to see them in action');
    console.log('');
    console.log('🔗 Workflow URLs:');
    console.log(`   - Contact Workflow: /dashboard/workflows/${workflow.id}/edit`);
    console.log(`   - Deal Workflow: /dashboard/workflows/${dealWorkflow.id}/edit`);

  } catch (error) {
    console.error('❌ Error seeding demo workflow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDemoWorkflow(); 