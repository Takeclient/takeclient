import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all available plans ordered by sortOrder
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    return NextResponse.json(plans);

  } catch (error) {
    console.error('Error fetching available plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 