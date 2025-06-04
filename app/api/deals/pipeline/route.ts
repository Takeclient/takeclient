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
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // For now, return a default pipeline structure
    // In the future, this could be customizable per tenant
    const pipeline = {
      id: 'default',
      name: 'Sales Pipeline',
      description: 'Default sales pipeline',
      isDefault: true,
      stages: [
        {
          id: 'PROSPECTING',
          name: 'Prospecting',
          description: 'Initial contact and lead qualification',
          color: '#6B7280',
          order: 1,
        },
        {
          id: 'QUALIFICATION',
          name: 'Qualification',
          description: 'Qualifying the opportunity',
          color: '#3B82F6',
          order: 2,
        },
        {
          id: 'PROPOSAL',
          name: 'Proposal',
          description: 'Proposal sent and under review',
          color: '#8B5CF6',
          order: 3,
        },
        {
          id: 'NEGOTIATION',
          name: 'Negotiation',
          description: 'Negotiating terms and pricing',
          color: '#F59E0B',
          order: 4,
        },
        {
          id: 'CLOSED_WON',
          name: 'Closed Won',
          description: 'Deal successfully closed',
          color: '#10B981',
          order: 5,
        },
        {
          id: 'CLOSED_LOST',
          name: 'Closed Lost',
          description: 'Deal lost or cancelled',
          color: '#EF4444',
          order: 6,
        },
      ],
    };

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 