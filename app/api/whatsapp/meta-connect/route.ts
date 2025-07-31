import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

// Use existing Meta access token to discover WhatsApp Business accounts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { metaAccessToken } = await req.json();

    if (!metaAccessToken) {
      return NextResponse.json({ error: 'Meta access token required' }, { status: 400 });
    }

    // 1. Get user's business accounts from Meta
    const businessAccountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/businesses?access_token=${metaAccessToken}`,
      { method: 'GET' }
    );

    if (!businessAccountsResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch business accounts' }, { status: 400 });
    }

    const businessAccounts = await businessAccountsResponse.json();

    // 2. For each business account, check for WhatsApp Business accounts
    const whatsappAccounts = [];

    for (const business of businessAccounts.data || []) {
      try {
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${business.id}/client_whatsapp_business_accounts?access_token=${metaAccessToken}`,
          { method: 'GET' }
        );

        if (whatsappResponse.ok) {
          const whatsappData = await whatsappResponse.json();
          
          for (const whatsappAccount of whatsappData.data || []) {
            // Get phone numbers for this WhatsApp Business account
            const phoneNumbersResponse = await fetch(
              `https://graph.facebook.com/v18.0/${whatsappAccount.id}/phone_numbers?access_token=${metaAccessToken}`,
              { method: 'GET' }
            );

            if (phoneNumbersResponse.ok) {
              const phoneNumbers = await phoneNumbersResponse.json();
              
              whatsappAccounts.push({
                businessId: business.id,
                businessName: business.name,
                whatsappBusinessAccountId: whatsappAccount.id,
                whatsappBusinessAccountName: whatsappAccount.name,
                phoneNumbers: phoneNumbers.data || [],
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching WhatsApp data for business ${business.id}:`, error);
        // Continue with other businesses
      }
    }

    return NextResponse.json({
      success: true,
      whatsappAccounts,
      message: `Found ${whatsappAccounts.length} WhatsApp Business account(s)`
    });

  } catch (error) {
    console.error('Meta WhatsApp discovery error:', error);
    return NextResponse.json({ error: 'Failed to discover WhatsApp accounts' }, { status: 500 });
  }
}

// Create WhatsApp integration from discovered account
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const { 
      metaAccessToken,
      whatsappBusinessAccountId,
      phoneNumberId,
      phoneNumber,
      integrationName
    } = await req.json();

    if (!metaAccessToken || !whatsappBusinessAccountId || !phoneNumberId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Encrypt the access token
    import crypto from 'crypto';
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
    
    let encrypted = cipher.update(metaAccessToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const encryptedToken = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    // Generate webhook verify token
    const webhookVerifyToken = `whatsapp_${crypto.randomBytes(16).toString('hex')}`;

    // Create the integration
    const integration = await prisma.whatsAppIntegration.create({
      data: {
        tenantId: user.tenantId,
        name: integrationName || `WhatsApp ${phoneNumber}`,
        phoneNumber: phoneNumber,
        phoneNumberId: phoneNumberId,
        businessAccountId: whatsappBusinessAccountId,
        accessToken: encryptedToken,
        webhookVerifyToken: webhookVerifyToken,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        name: integration.name,
        phoneNumber: integration.phoneNumber,
        webhookUrl: `${process.env.NEXTAUTH_URL}/api/whatsapp/webhook`,
        webhookVerifyToken: webhookVerifyToken,
      },
      message: 'WhatsApp integration created successfully!'
    });

  } catch (error) {
    console.error('WhatsApp integration creation error:', error);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
} 