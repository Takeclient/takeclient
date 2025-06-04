import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this';

// Encrypt sensitive data
function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
function decrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Validation schema for creating a provider
const createProviderSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INTERNAL_SMTP', 'SENDGRID', 'MAILGUN', 'AWS_SES', 'POSTMARK', 'SMTP2GO', 'SENDINBLUE', 'MAILCHIMP']),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  
  // SMTP settings
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  
  // API settings
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  
  // Sender settings
  defaultFromEmail: z.string().email().optional(),
  defaultFromName: z.string().optional(),
  replyToEmail: z.string().email().optional(),
  
  // Rate limits
  dailyLimit: z.number().optional(),
  hourlyLimit: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Get providers without sensitive data
    const providers = await prisma.emailProvider.findMany({
      where: {
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        isDefault: true,
        defaultFromEmail: true,
        defaultFromName: true,
        replyToEmail: true,
        dailyLimit: true,
        hourlyLimit: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Check if user has permission to manage providers
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createProviderSchema.parse(body);

    // Check if provider name already exists for tenant
    const existingProvider = await prisma.emailProvider.findFirst({
      where: {
        tenantId: user.tenantId,
        name: validatedData.name,
      },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: 'A provider with this name already exists' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.emailProvider.updateMany({
        where: {
          tenantId: user.tenantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Prepare settings object with encrypted values
    const settings: any = {};
    
    if (validatedData.type === 'INTERNAL_SMTP') {
      settings.smtpHost = validatedData.smtpHost;
      settings.smtpPort = validatedData.smtpPort;
      settings.smtpSecure = validatedData.smtpSecure;
      settings.smtpUser = validatedData.smtpUser;
      if (validatedData.smtpPass) {
        settings.smtpPass = encrypt(validatedData.smtpPass);
      }
    } else {
      if (validatedData.apiKey) {
        settings.apiKey = encrypt(validatedData.apiKey);
      }
      if (validatedData.apiSecret) {
        settings.apiSecret = encrypt(validatedData.apiSecret);
      }
    }

    // Create provider
    const provider = await prisma.emailProvider.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        isActive: validatedData.isActive ?? true,
        isDefault: validatedData.isDefault ?? false,
        settings,
        smtpHost: validatedData.smtpHost,
        smtpPort: validatedData.smtpPort,
        smtpSecure: validatedData.smtpSecure,
        smtpUser: validatedData.smtpUser,
        smtpPass: validatedData.smtpPass ? encrypt(validatedData.smtpPass) : null,
        apiKey: validatedData.apiKey ? encrypt(validatedData.apiKey) : null,
        apiSecret: validatedData.apiSecret ? encrypt(validatedData.apiSecret) : null,
        defaultFromEmail: validatedData.defaultFromEmail,
        defaultFromName: validatedData.defaultFromName,
        replyToEmail: validatedData.replyToEmail,
        dailyLimit: validatedData.dailyLimit,
        hourlyLimit: validatedData.hourlyLimit,
        tenant: { connect: { id: user.tenantId } },
      },
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        isDefault: true,
        defaultFromEmail: true,
        defaultFromName: true,
        replyToEmail: true,
        dailyLimit: true,
        hourlyLimit: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'EmailProvider',
        resourceId: provider.id,
        metadata: {
          providerName: provider.name,
          providerType: provider.type,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({ provider });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating provider:', error);
    return NextResponse.json(
      { error: 'Failed to create provider' },
      { status: 500 }
    );
  }
} 