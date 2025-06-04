import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const deal = await prisma.deal.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
          take: 10,
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

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await req.json();

    // Verify deal exists and belongs to tenant
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      lastActivity: new Date(),
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.value !== undefined) updateData.value = body.value * 100; // Convert to cents
    if (body.stage !== undefined) updateData.stage = body.stage;
    if (body.probability !== undefined) updateData.probability = body.probability;
    if (body.closeDate !== undefined) updateData.closeDate = body.closeDate ? new Date(body.closeDate) : null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.contactId !== undefined) updateData.contactId = body.contactId;
    if (body.companyId !== undefined) updateData.companyId = body.companyId;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;

    const updatedDeal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedDeal);
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PUT method does the same as PATCH for editing deals
  return PATCH(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Verify deal exists and belongs to tenant
    const existingDeal = await prisma.deal.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 