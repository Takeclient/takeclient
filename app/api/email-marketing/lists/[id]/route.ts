import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await prisma.emailList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error('Error fetching email list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, doubleOptIn } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 });
    }

    // Check if list exists and belongs to tenant
    const existingList = await prisma.emailList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    // Check for duplicate name (excluding current list)
    const duplicateList = await prisma.emailList.findFirst({
      where: {
        name: name.trim(),
        tenantId: session.user.tenantId,
        id: { not: params.id },
      },
    });

    if (duplicateList) {
      return NextResponse.json({ error: 'A list with this name already exists' }, { status: 400 });
    }

    const updatedList = await prisma.emailList.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        doubleOptIn,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
    });

    return NextResponse.json({ list: updatedList });
  } catch (error) {
    console.error('Error updating email list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if list exists and belongs to tenant
    const existingList = await prisma.emailList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingList) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    // Delete all subscribers first, then the list
    await prisma.$transaction([
      prisma.emailSubscriber.deleteMany({
        where: { listId: params.id },
      }),
      prisma.emailList.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ message: 'Email list deleted successfully' });
  } catch (error) {
    console.error('Error deleting email list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 