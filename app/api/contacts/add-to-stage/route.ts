import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

// POST - Add multiple contacts to a specific stage
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { contactIds, stageId } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid contactIds' }, { status: 400 });
    }

    if (!stageId) {
      return NextResponse.json({ error: 'Missing stageId' }, { status: 400 });
    }

    // Verify stage belongs to user's tenant
    const stage = await prisma.contactStage.findFirst({
      where: {
        id: stageId,
        tenantId: user.tenantId,
      },
    });

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Verify all contacts belong to user's tenant
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        tenantId: user.tenantId,
      },
    });

    if (contacts.length !== contactIds.length) {
      return NextResponse.json({ error: 'Some contacts not found or unauthorized' }, { status: 404 });
    }

    // Update all contacts to the new stage
    const updatedContacts = await prisma.contact.updateMany({
      where: {
        id: { in: contactIds },
        tenantId: user.tenantId,
      },
      data: {
        stageId: stageId,
        lastActivity: new Date(),
      },
    });

    // Log activities for each contact
    const activities = contactIds.map(contactId => ({
      type: 'NOTE' as const,
      title: 'Contact added to stage',
      description: `Contact added to ${stage.name} stage`,
      userId: user.id,
      contactId: contactId,
      tenantId: user.tenantId,
      isCompleted: true,
      completedAt: new Date(),
    }));

    await prisma.activity.createMany({
      data: activities,
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedContacts.count,
      stage: stage.name,
      contactIds: contactIds,
    });
  } catch (error) {
    console.error('Error adding contacts to stage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 