import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true, role: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const dueDate = searchParams.get('dueDate') || '';
    const overdue = searchParams.get('overdue') === 'true';

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          contact: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          company: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
    }

    if (dueDate) {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (dueDate) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          where.dueDate = { gte: startDate, lt: endDate };
          break;
        case 'week':
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          where.dueDate = { gte: now, lte: endDate };
          break;
        case 'month':
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          where.dueDate = { gte: now, lte: endDate };
          break;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
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
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      contactId,
      companyId,
      dealId,
    } = body;

    // Validate required fields
    if (!title || !assignedTo) {
      return NextResponse.json(
        { error: 'Title and assignedTo are required' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify assignee belongs to the same tenant
    const assignee = await prisma.user.findFirst({
      where: { id: assignedTo, tenantId: user.tenantId },
    });
    if (!assignee) {
      return NextResponse.json(
        { error: 'Assignee not found' },
        { status: 404 }
      );
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

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        tenantId: user.tenantId,
        assignedTo,
        assignedBy: user.id,
        contactId: contactId || null,
        companyId: companyId || null,
        dealId: dealId || null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 