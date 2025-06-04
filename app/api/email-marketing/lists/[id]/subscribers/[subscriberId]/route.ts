import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subscriberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if list exists and belongs to tenant
    const list = await prisma.emailList.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'Email list not found' }, { status: 404 });
    }

    // Check if subscriber exists in this list
    const subscriber = await prisma.emailSubscriber.findFirst({
      where: {
        id: params.subscriberId,
        listId: params.id,
      },
    });

    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    // Delete the subscriber
    await prisma.emailSubscriber.delete({
      where: {
        id: params.subscriberId,
      },
    });

    return NextResponse.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 