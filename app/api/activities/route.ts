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
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const assignedTo = searchParams.get('assignedTo') || '';

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

    if (type) {
      where.type = type;
    }

    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'pending') {
      where.isCompleted = false;
    }

    if (assignedTo) {
      where.userId = assignedTo;
    }

    if (dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          where.createdAt = { gte: startDate };
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          where.createdAt = { gte: startDate };
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          where.createdAt = { gte: startDate };
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          where.createdAt = { gte: startDate };
          break;
      }
    }

    const activities = await prisma.activity.findMany({
      where,
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
      orderBy: [
        { scheduledAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
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
      type,
      title,
      description,
      duration,
      scheduledAt,
      contactId,
      companyId,
      dealId,
    } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    // Validate activity type
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

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        duration: duration ? parseInt(duration) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        tenantId: user.tenantId,
        userId: user.id,
        contactId: contactId || null,
        companyId: companyId || null,
        dealId: dealId || null,
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

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 