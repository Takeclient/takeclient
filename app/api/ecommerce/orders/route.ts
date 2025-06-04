import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as OrderStatus | null;
    const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null;
    const dateFilter = searchParams.get('dateFilter') || 'all';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: session.user.tenantId,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Add payment status filter
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Add date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateFrom: Date;

      switch (dateFilter) {
        case 'today':
          dateFrom = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          dateFrom = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateFrom = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateFrom = new Date(0);
      }

      where.createdAt = { gte: dateFrom };
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders with details
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true }
        },
        items: {
          select: { id: true }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    return NextResponse.json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
      customerId,
      customerEmail,
      customerPhone,
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      discountCode,
      customerNotes,
      source = 'manual'
    } = body;

    // Validate required fields
    if (!customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer email and items are required' },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderCount = await prisma.order.count({
      where: { tenantId: session.user.tenantId }
    });
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: item.variantId ? { where: { id: item.variantId } } : false }
      });

      if (!product || product.tenantId !== session.user.tenantId) {
        throw new Error(`Product ${item.productId} not found or access denied`);
      }

      const price = item.variantId && product.variants?.[0]?.price 
        ? product.variants[0].price 
        : product.price;

      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        variantName: item.variantId && product.variants?.[0] ? product.variants[0].name : null,
        sku: item.variantId && product.variants?.[0] ? product.variants[0].sku : product.sku,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        total: itemSubtotal
      });

      // Update inventory for physical products
      if (product.type === 'PHYSICAL') {
        const inventory = await prisma.inventory.findFirst({
          where: {
            productId: product.id,
            variantId: item.variantId || null,
            location: 'main'
          }
        });

        if (inventory) {
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: {
              reservedQuantity: { increment: item.quantity },
              availableQuantity: { decrement: item.quantity }
            }
          });

          // Create inventory movement
          await prisma.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              type: 'SALE',
              quantity: -item.quantity,
              reason: 'Order placed',
              reference: orderNumber
            }
          });
        }
      }
    }

    // TODO: Calculate tax, shipping, and apply discount
    const taxAmount = 0; // Implement tax calculation
    const shippingAmount = 0; // Implement shipping calculation
    const discountAmount = 0; // Implement discount calculation

    const total = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create the order
    const order = await prisma.order.create({
      data: {
        tenantId: session.user.tenantId,
        orderNumber,
        status: 'PENDING',
        customerId: customerId || null,
        customerEmail,
        customerPhone: customerPhone || null,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        total,
        discountCode: discountCode || null,
        shippingMethod: shippingMethod || null,
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod || null,
        customerNotes: customerNotes || null,
        source,
        items: {
          create: orderItems
        },
        ...(shippingAddress && {
          shippingAddress: {
            create: shippingAddress
          }
        }),
        ...(billingAddress && {
          billingAddress: {
            create: billingAddress
          }
        })
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true
      }
    });

    // TODO: Send order confirmation email

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 