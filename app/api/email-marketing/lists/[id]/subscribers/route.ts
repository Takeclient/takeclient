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

    const subscribers = await prisma.emailSubscriber.findMany({
      where: {
        listId: params.id,
      },
      orderBy: {
        subscribedAt: 'desc',
      },
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, firstName, lastName, source = 'MANUAL' } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    // Check if subscriber already exists in this list
    const existingSubscriber = await prisma.emailSubscriber.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        listId: params.id,
      },
    });

    if (existingSubscriber) {
      return NextResponse.json({ error: 'Email already subscribed to this list' }, { status: 400 });
    }

    const subscriber = await prisma.emailSubscriber.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        status: list.doubleOptIn ? 'PENDING' : 'ACTIVE',
        source,
        listId: params.id,
        subscribedAt: new Date(),
      },
    });

    return NextResponse.json({ subscriber }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 