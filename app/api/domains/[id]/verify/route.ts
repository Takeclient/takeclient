import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

// Helper function to generate verification TXT record
function generateVerificationTxtRecord(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'takeclient-verify-';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to verify domain (simplified - in production, you'd use DNS lookup)
async function verifyDomainTxtRecord(domain: string, txtRecord: string): Promise<boolean> {
  try {
    // In a real implementation, you would use DNS lookup to check if the TXT record exists
    // For now, we'll simulate verification based on some logic
    // You could use libraries like 'dns' module or external services
    
    // Simulated verification - in production, replace with actual DNS lookup
    // const dns = require('dns').promises;
    // const txtRecords = await dns.resolveTxt(domain);
    // return txtRecords.some(record => record.includes(txtRecord));
    
    // For demo purposes, we'll return true after a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error verifying domain:', error);
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    // Check if domain exists and belongs to tenant
    const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    });

    if (!existingDomain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    if (existingDomain.type === 'SUBDOMAIN') {
      return NextResponse.json({ error: 'Subdomains do not require verification' }, { status: 400 });
    }

    if (action === 'generate') {
      // Generate TXT record for verification
      const txtRecord = generateVerificationTxtRecord();
      
      const domain = await prisma.domain.update({
        where: { id },
        data: {
          txtRecord,
          isVerified: false,
          verifiedAt: null,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        domain,
        instructions: {
          type: 'TXT',
          name: `_takeclient-challenge.${existingDomain.domain}`,
          value: txtRecord,
          ttl: 300,
        },
      });
    }

    if (action === 'verify') {
      if (!existingDomain.txtRecord) {
        return NextResponse.json({ error: 'No TXT record generated. Please generate verification record first.' }, { status: 400 });
      }

      // Verify the domain
      const isVerified = await verifyDomainTxtRecord(existingDomain.domain, existingDomain.txtRecord);

      if (isVerified) {
        const domain = await prisma.domain.update({
          where: { id },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          domain,
          message: 'Domain verified successfully!',
        });
      } else {
        return NextResponse.json({
          error: 'Domain verification failed. Please ensure the TXT record is properly configured.',
          instructions: {
            type: 'TXT',
            name: `_takeclient-challenge.${existingDomain.domain}`,
            value: existingDomain.txtRecord,
            ttl: 300,
          },
        }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Invalid action. Use "generate" or "verify".' }, { status: 400 });
  } catch (error) {
    console.error('Error in domain verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 