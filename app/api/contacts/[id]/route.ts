import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { triggerWorkflows } from '@/app/lib/workflow-triggers';

// GET - Get single contact with details and activities
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { id } = await params;

    // Get contact with all related data
    const contact = await prisma.contact.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stage: {
          select: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
        },
        deals: {
          select: {
            id: true,
            name: true,
            value: true,
            stage: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to last 50 activities
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get available stages for pipeline status change
    const stages = await prisma.contactStage.findMany({
      where: {
        tenantId: user.tenantId,
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      contact,
      stages,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update contact
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { id } = await params;
    const data = await req.json();

    // Verify contact belongs to user's tenant
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if email is being changed and if it conflicts
    if (data.email && data.email !== existingContact.email) {
      const emailConflict = await prisma.contact.findFirst({
        where: {
          tenantId: user.tenantId,
          email: data.email,
          id: { not: id },
        },
      });

      if (emailConflict) {
        return NextResponse.json({ 
          error: 'A contact with this email already exists' 
        }, { status: 400 });
      }
    }

    // Track stage change for activity log
    const stageChanged = data.stageId && data.stageId !== existingContact.stageId;
    let newStage = null;

    if (stageChanged) {
      newStage = await prisma.contactStage.findFirst({
        where: {
          id: data.stageId,
          tenantId: user.tenantId,
        },
      });
    }

    // Update contact
    const updatedContact = await prisma.contact.update({
      where: { id: id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        status: data.status,
        notes: data.notes,
        leadScore: data.leadScore,
        tags: data.tags,
        companyId: data.companyId,
        stageId: data.stageId,
        lastActivity: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            website: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stage: {
          select: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
        },
      },
    });

    // Log stage change activity
    if (stageChanged && newStage) {
      await prisma.activity.create({
        data: {
          type: 'NOTE',
          title: 'Contact moved to new stage',
          description: `Contact moved to ${newStage.name} stage`,
          userId: user.id,
          contactId: id,
          tenantId: user.tenantId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }

    // Trigger workflows for contact update
    try {
      await triggerWorkflows.contactUpdated(existingContact, updatedContact, user.tenantId, user.id);
    } catch (workflowError) {
      console.error('Error triggering workflows for contact update:', workflowError);
      // Don't fail the contact update if workflow triggers fail
    }

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete contact
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { id } = await params;

    // Verify contact belongs to user's tenant
    const contact = await prisma.contact.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Delete contact (this will cascade delete related activities and tasks)
    await prisma.contact.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 