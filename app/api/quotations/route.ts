import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
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

    // Get tenant info for business name
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true },
    });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const contactId = searchParams.get('contactId');
    const companyId = searchParams.get('companyId');
    const dealId = searchParams.get('dealId');

    const where: any = {
      tenantId: user.tenantId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { billingName: { contains: search, mode: 'insensitive' } },
        { billingEmail: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    // Get tenant info for business name
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { name: true },
    });

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

    // Get business settings for quotation number
    const businessSettings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    const quotationPrefix = businessSettings?.quotationPrefix || 'QUO-';
    const nextNumber = (businessSettings?.nextQuotationNumber || 1);
    const quotationNumber = `${quotationPrefix}${String(nextNumber).padStart(6, '0')}`;

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

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        status: 'DRAFT',
        validUntil: new Date(validUntil),
        tenantId: user.tenantId,
        createdById: user.id,
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

    // Update business settings with next number
    if (businessSettings) {
      await prisma.businessSettings.update({
        where: { id: businessSettings.id },
        data: { nextQuotationNumber: nextNumber + 1 },
      });
    } else {
      // Create business settings if they don't exist
      await prisma.businessSettings.create({
        data: {
          tenantId: user.tenantId,
          businessName: tenant?.name || 'My Business',
          nextQuotationNumber: 2,
        },
      });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 