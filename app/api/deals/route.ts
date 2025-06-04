import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { DealStage } from '@prisma/client';
import { checkPlanLimit } from '@/app/lib/plan-limits';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Get search params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    
    // Build where clause
    const where: any = {
      tenantId: tenantId,
    };
    
    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { contact: { firstName: { contains: search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: search, mode: 'insensitive' } } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    // Apply stage filter
    if (stage && stage !== 'ALL') {
      where.stage = stage;
    }
    
    // Get total count
    const total = await prisma.deal.count({ where });
    
    // Get deals with pagination
    const deals = await prisma.deal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      deals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID not found' }, { status: 400 });
    }

    // Check plan limits before creating deal
    const limitCheck = await checkPlanLimit(tenantId, 'deals', 1);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.message || 'Deal limit exceeded',
        planLimit: {
          type: 'deals',
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
        }
      }, { status: 402 }); // 402 Payment Required for plan limits
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Deal name is required' }, { status: 400 });
    }
    
    if (!data.value || data.value <= 0) {
      return NextResponse.json({ error: 'Deal value must be greater than 0' }, { status: 400 });
    }
    
    // Validate stage
    if (!Object.values(DealStage).includes(data.stage)) {
      return NextResponse.json({ error: 'Invalid deal stage' }, { status: 400 });
    }
    
    // Create deal
    const deal = await prisma.deal.create({
      data: {
        name: data.name,
        value: data.value * 100, // Convert to cents
        stage: data.stage,
        probability: data.probability || 0,
        closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
        description: data.description,
        source: data.source,
        tags: data.tags || [],
        assignedTo: (session.user as any)?.id, // Assign to current user
        tenantId: tenantId,
        contactId: data.contactId,
        companyId: data.companyId,
        lastActivity: new Date(),
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 