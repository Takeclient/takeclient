import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

// POST - Move contact to different stage
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

    const { contactId, newStageId } = await req.json();

    if (!contactId || !newStageId) {
      return NextResponse.json({ error: 'Missing contactId or newStageId' }, { status: 400 });
    }

    // Verify contact belongs to user's tenant
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId: user.tenantId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Verify stage belongs to user's tenant
    const stage = await prisma.contactStage.findFirst({
      where: {
        id: newStageId,
        tenantId: user.tenantId,
      },
    });

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    // Update contact stage
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        stageId: newStageId,
        lastActivity: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE',
        title: 'Contact moved to new stage',
        description: `Contact moved to ${stage.name} stage`,
        userId: user.id,
        contactId: contactId,
        tenantId: user.tenantId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      contact: updatedContact,
      stage: stage.name 
    });
  } catch (error) {
    console.error('Error moving contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 