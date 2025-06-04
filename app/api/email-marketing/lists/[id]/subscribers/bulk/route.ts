import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriberIds } = await request.json();

    if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json({ error: 'Subscriber IDs are required' }, { status: 400 });
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

    // Delete subscribers that belong to this list
    const deleteResult = await prisma.emailSubscriber.deleteMany({
      where: {
        id: { in: subscriberIds },
        listId: params.id,
      },
    });

    return NextResponse.json({ 
      message: `Successfully removed ${deleteResult.count} subscribers`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error('Error bulk deleting subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 