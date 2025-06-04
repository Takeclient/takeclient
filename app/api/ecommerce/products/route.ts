import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';
import { checkPlanLimit } from '@/app/lib/plan-limits';

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products with related data
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        inventory: {
          select: {
            quantity: true,
            availableQuantity: true,
          }
        },
        _count: {
          select: {
            variants: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Transform products to include variant count
    const transformedProducts = products.map((product: any) => ({
      ...product,
      variantsCount: product._count.variants,
      _count: undefined,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    // Check plan limits
    const limitCheck = await checkPlanLimit(user.tenantId, 'products', 1);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.message || 'Product limit exceeded',
        planLimit: {
          type: 'products',
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
        }
      }, { status: 402 });
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
    const existingSlug = await prisma.product.findFirst({
      where: {
        tenantId: user.tenantId,
        slug: data.slug,
      }
    });

    if (existingSlug) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        barcode: data.barcode,
        type: data.type,
        status: data.status || 'DRAFT',
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        cost: data.cost,
        // Digital product fields
        downloadUrl: data.downloadUrl,
        downloadLimit: data.downloadLimit,
        downloadExpiry: data.downloadExpiry,
        // Physical product fields
        weight: data.weight,
        length: data.length,
        width: data.width,
        height: data.height,
        requiresShipping: data.requiresShipping || false,
        // Media
        images: data.images,
        featuredImage: data.featuredImage,
        // SEO
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        // Other
        tags: data.tags || [],
        isActive: data.isActive !== false,
        categoryId: data.categoryId,
        tenantId: user.tenantId,
      },
      include: {
        category: true,
      }
    });

    // Create initial inventory record for physical products
    if (product.type === 'PHYSICAL') {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: data.initialStock || 0,
          availableQuantity: data.initialStock || 0,
          trackQuantity: data.trackQuantity !== false,
          allowBackorder: data.allowBackorder || false,
          lowStockThreshold: data.lowStockThreshold,
          location: 'main',
        }
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 