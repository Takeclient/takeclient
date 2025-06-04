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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
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

    const invoices = await prisma.invoice.findMany({
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
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
          },
        },
        proforma: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
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

    const body = await req.json();
    const {
      quotationId,
      proformaId,
      contactId,
      companyId,
      dealId,
      dueDate,
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
      paymentMethod,
      paymentReference,
    } = body;

    // Get business settings for invoice number
    const businessSettings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    const invoicePrefix = businessSettings?.invoicePrefix || 'INV-';
    const nextNumber = (businessSettings?.nextInvoiceNumber || 1);
    const invoiceNumber = `${invoicePrefix}${String(nextNumber).padStart(6, '0')}`;

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

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: 'DRAFT',
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        tenantId: user.tenantId,
        createdById: user.id,
        quotationId,
        proformaId,
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
        paidAmount: 0,
        dueAmount: Math.round(totalAmount),
        terms,
        notes,
        paymentMethod,
        paymentReference,
        items: {
          create: processedItems,
        },
      },
      include: {
        contact: true,
        company: true,
        deal: true,
        quotation: true,
        proforma: true,
        items: true,
      },
    });

    // Update business settings with next number
    if (businessSettings) {
      await prisma.businessSettings.update({
        where: { id: businessSettings.id },
        data: { nextInvoiceNumber: nextNumber + 1 },
      });
    } else {
      // Create business settings if they don't exist
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { name: true },
      });

      await prisma.businessSettings.create({
        data: {
          tenantId: user.tenantId,
          businessName: tenant?.name || 'My Business',
          nextInvoiceNumber: 2,
        },
      });
    }

    // If created from quotation, mark quotation as converted
    if (quotationId) {
      await prisma.quotation.update({
        where: { id: quotationId },
        data: { 
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });
    }

    // If created from proforma, mark proforma as converted
    if (proformaId) {
      await prisma.proformaInvoice.update({
        where: { id: proformaId },
        data: { 
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 