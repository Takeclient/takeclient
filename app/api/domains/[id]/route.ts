import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const updateDomainSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const domain = await prisma.domain.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    return NextResponse.json({ domain });
  } catch (error) {
    console.error('Error fetching domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateDomainSchema.parse(body);

    // Check if domain exists and belongs to tenant
    const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Update the domain
    const domain = await prisma.domain.update({
      where: { id },
      data: {
        ...validatedData,
        verifiedAt: validatedData.isVerified && !existingDomain.isVerified ? new Date() : existingDomain.verifiedAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ domain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if domain exists and belongs to tenant
    const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Don't allow deletion of subdomain type domains
    if (existingDomain.type === 'SUBDOMAIN') {
      return NextResponse.json({ error: 'Cannot delete subdomain' }, { status: 400 });
    }

    // Delete the domain
    await prisma.domain.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 