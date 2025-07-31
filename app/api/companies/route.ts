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
    
    // Build where clause
    const where: any = {
      tenantId: tenantId,
    };
    
    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    
    // Get total count
    const total = await prisma.company.count({ where });
    
    // Get companies with pagination
    const companies = await prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            contacts: true,
            deals: true,
          }
        }
      }
    });

    return NextResponse.json({
      companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching companies:', error);
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

    // Check plan limits before creating company
    const limitCheck = await checkPlanLimit(tenantId, 'companies', 1);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.message || 'Company limit exceeded',
        planLimit: {
          type: 'companies',
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
        }
      }, { status: 402 }); // 402 Payment Required for plan limits
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Validate name uniqueness within tenant
    const existingCompany = await prisma.company.findFirst({
      where: {
        tenantId: tenantId,
        name: data.name,
      },
    });
    
    if (existingCompany) {
      return NextResponse.json({ error: 'A company with this name already exists' }, { status: 400 });
    }
    
    // Create company
    const company = await prisma.company.create({
      data: {
        name: data.name,
        industry: data.industry,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        size: data.size,
        phone: data.phone,
        email: data.email,
        revenue: data.revenue ? data.revenue * 100 : undefined, // Convert to cents
        description: data.description,
        tags: data.tags || [],
        assignedTo: (session.user as any)?.id, // Assign to current user
        tenantId: tenantId,
        lastActivity: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Trigger workflows for company creation
    try {
      await triggerWorkflows.companyCreated(company, tenantId, (session.user as any)?.id);
    } catch (workflowError) {
      console.error('Error triggering workflows for company creation:', workflowError);
      // Don't fail the company creation if workflow triggers fail
    }

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 