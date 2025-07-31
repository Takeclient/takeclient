import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { triggerWorkflows } from '@/app/lib/workflow-triggers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const body = await request.json();
    const { triggerType, entityType, entityId } = body;

    // Validate input
    if (!triggerType || !entityType || !entityId) {
      return NextResponse.json({ 
        error: 'Missing required fields: triggerType, entityType, entityId' 
      }, { status: 400 });
    }

    // Get the entity data based on type
    let entityData = null;
    
    switch (entityType) {
      case 'contact':
        entityData = await prisma.contact.findFirst({
          where: { id: entityId, tenantId: user.tenantId },
        });
        break;
      case 'deal':
        entityData = await prisma.deal.findFirst({
          where: { id: entityId, tenantId: user.tenantId },
        });
        break;
      case 'company':
        entityData = await prisma.company.findFirst({
          where: { id: entityId, tenantId: user.tenantId },
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    if (!entityData) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Trigger the appropriate workflow
    let result;
    switch (triggerType) {
      case 'CONTACT_CREATED':
        result = await triggerWorkflows.contactCreated(entityData, user.tenantId, user.id);
        break;
      case 'CONTACT_UPDATED':
        // For testing, we'll use the same data for old and new
        result = await triggerWorkflows.contactUpdated(entityData, entityData, user.tenantId, user.id);
        break;
      case 'DEAL_CREATED':
        result = await triggerWorkflows.dealCreated(entityData, user.tenantId, user.id);
        break;
      case 'DEAL_UPDATED':
        result = await triggerWorkflows.dealUpdated(entityData, entityData, user.tenantId, user.id);
        break;
      case 'COMPANY_CREATED':
        result = await triggerWorkflows.companyCreated(entityData, user.tenantId, user.id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid trigger type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Workflow triggered successfully',
      triggerType,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error('Error triggering test workflow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 