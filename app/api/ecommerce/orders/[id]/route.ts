import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                featuredImage: true,
                type: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        fulfillments: {
          orderBy: { createdAt: 'desc' }
        },
        refunds: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, internalNotes } = body;

    // Verify order belongs to tenant
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};

    // Update status if provided
    if (status) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === 'PROCESSING' && !order.paymentStatus) {
        updateData.paymentStatus = 'PROCESSING';
      }
      if (status === 'SHIPPED' && !order.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (status === 'DELIVERED' && !order.deliveredAt) {
        updateData.deliveredAt = new Date();
        updateData.completedAt = new Date();
      }
      if (status === 'CANCELED' && !order.canceledAt) {
        updateData.canceledAt = new Date();
      }
    }

    // Update internal notes if provided
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        fulfillments: true,
        refunds: true
      }
    });

    // If canceling order, release inventory
    if (status === 'CANCELED' && order.status !== 'CANCELED') {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true }
      });

      for (const item of orderItems) {
        if (item.product.type === 'PHYSICAL') {
          const inventory = await prisma.inventory.findFirst({
            where: {
              productId: item.productId,
              variantId: item.variantId,
              location: 'main'
            }
          });

          if (inventory) {
            await prisma.inventory.update({
              where: { id: inventory.id },
              data: {
                reservedQuantity: { decrement: item.quantity },
                availableQuantity: { increment: item.quantity }
              }
            });

            // Create inventory movement
            await prisma.inventoryMovement.create({
              data: {
                inventoryId: inventory.id,
                type: 'ADJUSTMENT',
                quantity: item.quantity,
                reason: 'Order canceled',
                reference: order.orderNumber
              }
            });
          }
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 