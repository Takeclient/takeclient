import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(
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

    // Get the original quotation
    const originalQuotation = await prisma.quotation.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!originalQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Get business settings for quotation number
    const businessSettings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    const quotationPrefix = businessSettings?.quotationPrefix || 'QUO-';
    const nextNumber = (businessSettings?.nextQuotationNumber || 1);
    const quotationNumber = `${quotationPrefix}${String(nextNumber).padStart(6, '0')}`;

    // Create the duplicate quotation
    const duplicateQuotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        status: 'DRAFT',
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        tenantId: user.tenantId,
        createdById: user.id,
        contactId: originalQuotation.contactId,
        companyId: originalQuotation.companyId,
        dealId: originalQuotation.dealId,
        billingName: originalQuotation.billingName,
        billingEmail: originalQuotation.billingEmail,
        billingPhone: originalQuotation.billingPhone,
        billingAddress: originalQuotation.billingAddress,
        billingCity: originalQuotation.billingCity,
        billingState: originalQuotation.billingState,
        billingZipCode: originalQuotation.billingZipCode,
        billingCountry: originalQuotation.billingCountry,
        subtotal: originalQuotation.subtotal,
        taxAmount: originalQuotation.taxAmount,
        discountType: originalQuotation.discountType,
        discountValue: originalQuotation.discountValue,
        discountAmount: originalQuotation.discountAmount,
        totalAmount: originalQuotation.totalAmount,
        terms: originalQuotation.terms,
        notes: originalQuotation.notes,
        items: {
          create: originalQuotation.items.map((item, index) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            totalAmount: item.totalAmount,
            sortOrder: index,
          })),
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
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { name: true },
      });

      await prisma.businessSettings.create({
        data: {
          tenantId: user.tenantId,
          businessName: tenant?.name || 'My Business',
          nextQuotationNumber: 2,
        },
      });
    }

    return NextResponse.json(duplicateQuotation);
  } catch (error) {
    console.error('Error duplicating quotation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 