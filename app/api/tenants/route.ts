import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';
import { Role } from '@prisma/client';

// Simple addDays function to replace date-fns dependency
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function POST(request: Request) {
  try {
    // Safely get session - wrapped in try/catch to handle session errors
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      console.error('[TENANT_CREATE_ERROR] Unauthorized or invalid session', { sessionExists: !!session });
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Safely parse request body
    let name, slug;
    try {
      const body = await request.json();
      name = body.name;
      slug = body.slug;
    } catch (e) {
      console.error('[TENANT_CREATE_ERROR] Invalid JSON in request body', e);
      return NextResponse.json(
        { message: 'Invalid request format.' },
        { status: 400 }
      );
    }

    // Check if required fields are present
    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Name and slug are required.' },
        { status: 400 }
      );
    }

    // Check if slug is available
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: 'This URL is already taken. Please choose another one.' },
        { status: 409 }
      );
    }

    // Get the FREE plan to assign to new tenants
    const freePlan = await prisma.plan.findUnique({
      where: { name: 'FREE' }
    });

    if (!freePlan) {
      console.error('[TENANT_CREATE_ERROR] FREE plan not found. Make sure to run seed-plans.ts');
      return NextResponse.json(
        { message: 'System configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = addDays(new Date(), 14);

    // Create tenant (company)
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        planId: freePlan.id, // Use the actual plan ID
        trialEndsAt,
      },
    });

    // Assign tenant to current user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tenantId: tenant.id,
        role: Role.TENANT_ADMIN, // First user is tenant admin
      },
    });

    return NextResponse.json(
      {
        message: 'Tenant created successfully',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[TENANT_CREATE_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
