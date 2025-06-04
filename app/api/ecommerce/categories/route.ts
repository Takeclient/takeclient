import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true }
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const parentId = searchParams.get('parentId');

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
      isActive: true,
    };

    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    // Get categories
    const categories = await prisma.productCategory.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          }
        },
        ...(includeProducts && {
          products: {
            take: 5,
            where: { isActive: true, status: 'ACTIVE' },
            select: {
              id: true,
              name: true,
              price: true,
              featuredImage: true,
            }
          }
        })
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true, role: true }
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 403 });
    }

    const data = await req.json();

    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    // Ensure unique slug within tenant
    const existingSlug = await prisma.productCategory.findFirst({
      where: {
        tenantId: user.tenantId,
        slug: data.slug,
      }
    });

    if (existingSlug) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    // Create category
    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== false,
        tenantId: user.tenantId,
      },
      include: {
        parent: true,
        _count: {
          select: {
            products: true,
          }
        }
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 