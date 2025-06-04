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

    const settings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    if (!settings) {
      return NextResponse.json({ error: 'Business settings not found' }, { status: 404 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching business settings:', error);
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
    
    // Check if settings already exist
    const existingSettings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    if (existingSettings) {
      return NextResponse.json({ error: 'Business settings already exist. Use PUT to update.' }, { status: 400 });
    }

    const settings = await prisma.businessSettings.create({
      data: {
        tenantId: user.tenantId,
        businessName: body.businessName || '',
        businessEmail: body.businessEmail || null,
        businessPhone: body.businessPhone || null,
        businessWebsite: body.businessWebsite || null,
        businessAddress: body.businessAddress || null,
        businessCity: body.businessCity || null,
        businessState: body.businessState || null,
        businessZipCode: body.businessZipCode || null,
        businessCountry: body.businessCountry || null,
        taxId: body.taxId || null,
        vatNumber: body.vatNumber || null,
        defaultTaxRate: body.defaultTaxRate || 0,
        bankName: body.bankName || null,
        bankAccountNumber: body.bankAccountNumber || null,
        bankRoutingNumber: body.bankRoutingNumber || null,
        bankSwiftCode: body.bankSwiftCode || null,
        bankIban: body.bankIban || null,
        invoicePrefix: body.invoicePrefix || 'INV-',
        quotationPrefix: body.quotationPrefix || 'QUO-',
        proformaPrefix: body.proformaPrefix || 'PRO-',
        defaultPaymentTerms: body.defaultPaymentTerms || null,
        defaultQuotationTerms: body.defaultQuotationTerms || null,
        logoUrl: body.logoUrl || null,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error creating business settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    
    // Check if settings exist
    const existingSettings = await prisma.businessSettings.findUnique({
      where: { tenantId: user.tenantId },
    });

    if (!existingSettings) {
      return NextResponse.json({ error: 'Business settings not found. Use POST to create.' }, { status: 404 });
    }

    const settings = await prisma.businessSettings.update({
      where: { tenantId: user.tenantId },
      data: {
        businessName: body.businessName,
        businessEmail: body.businessEmail || null,
        businessPhone: body.businessPhone || null,
        businessWebsite: body.businessWebsite || null,
        businessAddress: body.businessAddress || null,
        businessCity: body.businessCity || null,
        businessState: body.businessState || null,
        businessZipCode: body.businessZipCode || null,
        businessCountry: body.businessCountry || null,
        taxId: body.taxId || null,
        vatNumber: body.vatNumber || null,
        defaultTaxRate: body.defaultTaxRate || 0,
        bankName: body.bankName || null,
        bankAccountNumber: body.bankAccountNumber || null,
        bankRoutingNumber: body.bankRoutingNumber || null,
        bankSwiftCode: body.bankSwiftCode || null,
        bankIban: body.bankIban || null,
        invoicePrefix: body.invoicePrefix || 'INV-',
        quotationPrefix: body.quotationPrefix || 'QUO-',
        proformaPrefix: body.proformaPrefix || 'PRO-',
        defaultPaymentTerms: body.defaultPaymentTerms || null,
        defaultQuotationTerms: body.defaultQuotationTerms || null,
        logoUrl: body.logoUrl || null,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating business settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 