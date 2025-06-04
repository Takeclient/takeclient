import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import crypto from 'crypto';

// Encryption functions
const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// GET - List all WhatsApp integrations for the tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
    }

    const integrations = await prisma.whatsAppIntegration.findMany({
      where: {
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        phoneNumberId: true,
        businessAccountId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching WhatsApp integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new WhatsApp integration
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

    // Check if user has permission to create integrations
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.phoneNumber || !data.phoneNumberId || 
        !data.businessAccountId || !data.accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if phone number already exists for this tenant
    const existing = await prisma.whatsAppIntegration.findUnique({
      where: {
        tenantId_phoneNumber: {
          tenantId: user.tenantId,
          phoneNumber: data.phoneNumber,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'A WhatsApp integration with this phone number already exists' 
      }, { status: 400 });
    }

    // Encrypt the access token
    const encryptedToken = encrypt(data.accessToken);

    // Generate webhook verify token if not provided
    const webhookVerifyToken = data.webhookVerifyToken || crypto.randomBytes(32).toString('hex');

    // Create the integration
    const integration = await prisma.whatsAppIntegration.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        phoneNumberId: data.phoneNumberId,
        businessAccountId: data.businessAccountId,
        accessToken: encryptedToken,
        webhookVerifyToken: webhookVerifyToken,
        isActive: true,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        phoneNumberId: true,
        businessAccountId: true,
        webhookVerifyToken: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log the integration creation
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'WHATSAPP_INTEGRATION',
        resourceId: integration.id,
        metadata: {
          name: integration.name,
          phoneNumber: integration.phoneNumber,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({ 
      integration,
      message: 'WhatsApp integration created successfully' 
    });
  } catch (error) {
    console.error('Error creating WhatsApp integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 