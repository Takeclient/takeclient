import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const domainSchema = z.object({
  domain: z.string().min(1),
  type: z.enum(['SUBDOMAIN', 'CUSTOM']),
});

// Helper function to generate unique subdomain codes
function generateUniqueCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate CNAME record
function generateCNAME(domain: string): string {
  const isLocalhost = process.env.NODE_ENV === 'development';
  return isLocalhost ? 'localhost:3000' : 'takeclient.com';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all domains for the tenant
    const domains = await prisma.domain.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate default subdomain if none exists
    let defaultSubdomain = domains.find(d => d.type === 'SUBDOMAIN');
    if (!defaultSubdomain) {
      const uniqueCode = generateUniqueCode();
      const isLocalhost = process.env.NODE_ENV === 'development';
      const subdomainName = isLocalhost ? `localhost:3000/${uniqueCode}` : `${uniqueCode}.takeclient.com`;
      
      defaultSubdomain = await prisma.domain.create({
        data: {
          domain: subdomainName,
          type: 'SUBDOMAIN',
          isVerified: true,
          isActive: true,
          cname: generateCNAME(subdomainName),
          tenantId: session.user.tenantId,
        },
      });
      
      domains.unshift(defaultSubdomain);
    }

    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = domainSchema.parse(body);

    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: {
        domain: validatedData.domain,
      },
    });

    if (existingDomain) {
      return NextResponse.json({ error: 'Domain already exists' }, { status: 400 });
    }

    // Generate CNAME for the domain
    const cname = generateCNAME(validatedData.domain);

    // Create the domain
    const domain = await prisma.domain.create({
      data: {
        domain: validatedData.domain,
        type: validatedData.type,
        isVerified: validatedData.type === 'SUBDOMAIN', // Subdomains are auto-verified
        isActive: true,
        cname: cname,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json({ domain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error creating domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 