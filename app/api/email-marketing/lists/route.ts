import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Validation schema for creating a list
const createListSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  doubleOptIn: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get lists with subscriber counts
    const [lists, total] = await Promise.all([
      prisma.emailList.findMany({
        where: {
          tenantId: user.tenantId,
        },
        include: {
          _count: {
            select: {
              subscribers: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.emailList.count({
        where: {
          tenantId: user.tenantId,
        },
      }),
    ]);

    return NextResponse.json({
      lists,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Check if user has permission to create lists
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createListSchema.parse(body);

    // Check if list name already exists for tenant
    const existingList = await prisma.emailList.findFirst({
      where: {
        tenantId: user.tenantId,
        name: validatedData.name,
      },
    });

    if (existingList) {
      return NextResponse.json(
        { error: 'A list with this name already exists' },
        { status: 400 }
      );
    }

    // Create list
    const list = await prisma.emailList.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        doubleOptIn: validatedData.doubleOptIn ?? false,
        tenant: { connect: { id: user.tenantId } },
      },
      include: {
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'EmailList',
        resourceId: list.id,
        metadata: {
          listName: list.name,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({ list });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
} 