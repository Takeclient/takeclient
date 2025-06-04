import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      duration,
      scheduledAt,
      isCompleted,
      contactId,
      companyId,
      dealId,
    } = body;

    // Check if activity exists and belongs to tenant
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Validate activity type if provided
    if (type) {
      const validTypes = [
        'CALL',
        'EMAIL',
        'MEETING',
        'TASK',
        'NOTE',
        'SMS',
        'LINKEDIN_MESSAGE',
        'DEMO',
        'FOLLOW_UP',
        'PROPOSAL_SENT',
        'CONTRACT_SENT',
        'PAYMENT_RECEIVED',
      ];

      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 }
        );
      }
    }

    // Verify related entities belong to the same tenant
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: contactId, tenantId: user.tenantId },
      });
      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
    }

    if (companyId) {
      const company = await prisma.company.findFirst({
        where: { id: companyId, tenantId: user.tenantId },
      });
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
    }

    if (dealId) {
      const deal = await prisma.deal.findFirst({
        where: { id: dealId, tenantId: user.tenantId },
      });
      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (type !== undefined) updateData.type = type;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (contactId !== undefined) updateData.contactId = contactId || null;
    if (companyId !== undefined) updateData.companyId = companyId || null;
    if (dealId !== undefined) updateData.dealId = dealId || null;
    
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // Check if activity exists and belongs to tenant
    const activity = await prisma.activity.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await prisma.activity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 