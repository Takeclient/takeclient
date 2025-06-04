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
    const sortBy = searchParams.get('sortBy') || 'recent';

    const skip = (page - 1) * limit;

    // Build where clause for customers who have orders
    const where: any = {
      tenantId: session.user.tenantId,
      orders: {
        some: {} // Only get contacts who have at least one order
      }
    };

    // Add search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.contact.count({ where });

    // Build orderBy based on sortBy parameter
    let orderBy: any = {};
    if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    // Get customers with basic info
    const customers = await prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: { orders: true }
        },
        orders: {
          select: {
            total: true,
            createdAt: true
          }
        }
      }
    });

    // Process customers to add computed fields
    const processedCustomers = customers.map(customer => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = customer._count.orders;
      const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
      const lastOrder = customer.orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt,
        _count: {
          orders: orderCount
        },
        totalSpent,
        averageOrderValue,
        lastOrderDate: lastOrder?.createdAt || null
      };
    });

    // Sort by total spent or order count if needed
    if (sortBy === 'spent') {
      processedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sortBy === 'orders') {
      processedCustomers.sort((a, b) => b._count.orders - a._count.orders);
    }

    return NextResponse.json({
      customers: processedCustomers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 