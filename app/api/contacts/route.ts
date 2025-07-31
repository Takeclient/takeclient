import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { checkPlanLimit } from '@/app/lib/plan-limits';
import { triggerWorkflows } from '@/app/lib/workflow-triggers';

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
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    
    // Build where clause
    const where: any = {
      tenantId: tenantId,
    };
    
    // Apply search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    // Apply status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    // Apply source filter
    if (source && source !== 'ALL') {
      where.source = source;
    }
    
    // Get total count
    const total = await prisma.contact.count({ where });
    
    // Get contacts with pagination
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching contacts:', error);
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

    // Check plan limits before creating contact
    const limitCheck = await checkPlanLimit(tenantId, 'contacts', 1);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.message || 'Contact limit exceeded',
        planLimit: {
          type: 'contacts',
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
        }
      }, { status: 402 }); // 402 Payment Required for plan limits
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Validate email uniqueness within tenant if provided
    if (data.email) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          tenantId: tenantId,
          email: data.email,
        },
      });
      
      if (existingContact) {
        return NextResponse.json({ error: 'A contact with this email already exists' }, { status: 400 });
      }
    }
    
    // Create contact
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        status: data.status || 'LEAD',
        source: data.source,
        notes: data.notes,
        leadScore: data.leadScore || 0,
        tags: data.tags || [],
        assignedTo: (session.user as any)?.id, // Assign to current user
        tenantId: tenantId,
        companyId: data.companyId,
        lastActivity: new Date(),
      },
      include: {
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

    // Trigger workflows for contact creation
    try {
      await triggerWorkflows.contactCreated(contact, tenantId, (session.user as any)?.id);
    } catch (workflowError) {
      console.error('Error triggering workflows for contact creation:', workflowError);
      // Don't fail the contact creation if workflow triggers fail
    }

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 