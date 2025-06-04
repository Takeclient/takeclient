import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const quotation = await prisma.quotation.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // Check if quotation exists and belongs to tenant
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      contactId,
      companyId,
      dealId,
      validUntil,
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      billingCity,
      billingState,
      billingZipCode,
      billingCountry,
      discountType,
      discountValue,
      terms,
      notes,
      items,
    } = body;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const processedItems = items.map((item: any, index: number) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = itemTotal * (item.taxRate / 100);
      
      subtotal += itemTotal;
      taxAmount += itemTax;

      return {
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        taxAmount: Math.round(itemTax),
        totalAmount: Math.round(itemTotal + itemTax),
        sortOrder: index,
      };
    });

    // Calculate discount
    let discountAmount = 0;
    if (discountValue > 0) {
      if (discountType === 'PERCENTAGE') {
        discountAmount = Math.round(subtotal * (discountValue / 100));
      } else {
        discountAmount = Math.round(discountValue * 100); // Convert to cents
      }
    }

    const totalAmount = subtotal + taxAmount - discountAmount;

    // Update quotation
    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        validUntil: new Date(validUntil),
        contactId,
        companyId,
        dealId,
        billingName,
        billingEmail,
        billingPhone,
        billingAddress,
        billingCity,
        billingState,
        billingZipCode,
        billingCountry,
        subtotal: Math.round(subtotal),
        taxAmount: Math.round(taxAmount),
        discountType: discountType || 'PERCENTAGE',
        discountValue: discountValue || 0,
        discountAmount: Math.round(discountAmount),
        totalAmount: Math.round(totalAmount),
        terms,
        notes,
        items: {
          deleteMany: {},
          create: processedItems,
        },
      },
      include: {
        contact: true,
        company: true,
        deal: true,
        items: true,
      },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    // Check if quotation exists and belongs to tenant
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Delete quotation (items will be deleted automatically due to cascade)
    await prisma.quotation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 