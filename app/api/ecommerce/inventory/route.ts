import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const stockStatus = searchParams.get('stockStatus') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      product: {
        tenantId: session.user.tenantId
      }
    };

    // Add search filter
    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { variant: { name: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add location filter
    if (location && location !== 'all') {
      where.location = location;
    }

    // Get all inventory items first to filter by stock status
    const allInventory = await prisma.inventory.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            featuredImage: true,
            type: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        movements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            quantity: true,
            reason: true,
            createdAt: true
          }
        }
      }
    });

    // Filter by stock status in memory
    let filteredInventory = allInventory;
    if (stockStatus && stockStatus !== 'all') {
      filteredInventory = allInventory.filter(item => {
        if (!item.trackQuantity) return stockStatus === 'untracked';
        if (item.availableQuantity <= 0 && !item.allowBackorder) return stockStatus === 'out-of-stock';
        if (item.lowStockThreshold && item.availableQuantity <= item.lowStockThreshold) return stockStatus === 'low-stock';
        return stockStatus === 'in-stock';
      });
    }

    // Apply pagination
    const total = filteredInventory.length;
    const paginatedInventory = filteredInventory.slice(skip, skip + limit);

    return NextResponse.json({
      inventory: paginatedInventory,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      inventoryId,
      type,
      quantity,
      reason,
      reference
    } = body;

    // Validate inventory item
    const inventory = await prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        product: {
          tenantId: session.user.tenantId
        }
      }
    });

    if (!inventory) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Update inventory quantities
    const updateData: any = {};
    
    if (type === 'PURCHASE' || type === 'RETURN') {
      updateData.quantity = { increment: Math.abs(quantity) };
      updateData.availableQuantity = { increment: Math.abs(quantity) };
      if (type === 'PURCHASE') {
        updateData.lastRestockDate = new Date();
        updateData.lastRestockQuantity = Math.abs(quantity);
      }
    } else if (type === 'SALE' || type === 'DAMAGE') {
      updateData.quantity = { decrement: Math.abs(quantity) };
      updateData.availableQuantity = { decrement: Math.abs(quantity) };
    } else if (type === 'ADJUSTMENT') {
      const diff = quantity;
      if (diff > 0) {
        updateData.quantity = { increment: diff };
        updateData.availableQuantity = { increment: diff };
      } else {
        updateData.quantity = { decrement: Math.abs(diff) };
        updateData.availableQuantity = { decrement: Math.abs(diff) };
      }
    }

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: updateData
    });

    // Create movement record
    const movement = await prisma.inventoryMovement.create({
      data: {
        inventoryId,
        type,
        quantity: type === 'ADJUSTMENT' ? quantity : (type === 'PURCHASE' || type === 'RETURN' ? Math.abs(quantity) : -Math.abs(quantity)),
        reason,
        reference,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ inventory: updatedInventory, movement }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    );
  }
} 