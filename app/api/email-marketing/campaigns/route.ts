import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating a campaign
const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  type: z.enum(['REGULAR', 'AUTOMATED', 'TRANSACTIONAL', 'AB_TEST']),
  htmlContent: z.string(),
  textContent: z.string().optional(),
  designJson: z.any().optional(),
  providerId: z.string(),
  templateId: z.string().optional(),
  listIds: z.array(z.string()),
  scheduledAt: z.string().optional(),
  openTracking: z.boolean().optional(),
  clickTracking: z.boolean().optional(),
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Get campaigns with related data
    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          lists: {
            include: {
              list: {
                select: {
                  id: true,
                  name: true,
                  subscriberCount: true,
                },
              },
            },
          },
          _count: {
            select: {
              emailSends: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns: campaigns.map(campaign => ({
        ...campaign,
        lists: campaign.lists.map(cl => cl.list),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
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

    // Check if user has permission to create campaigns
    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    // Verify provider exists and belongs to tenant
    const provider = await prisma.emailProvider.findFirst({
      where: {
        id: validatedData.providerId,
        tenantId: user.tenantId,
        isActive: true,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Invalid or inactive provider' }, { status: 400 });
    }

    // Verify lists exist and belong to tenant
    const lists = await prisma.emailList.findMany({
      where: {
        id: { in: validatedData.listIds },
        tenantId: user.tenantId,
      },
    });

    if (lists.length !== validatedData.listIds.length) {
      return NextResponse.json({ error: 'One or more lists not found' }, { status: 400 });
    }

    // Calculate recipient count
    const recipientCount = await prisma.emailSubscriber.count({
      where: {
        listId: { in: validatedData.listIds },
        status: 'ACTIVE',
      },
    });

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: validatedData.name,
        subject: validatedData.subject,
        previewText: validatedData.previewText,
        type: validatedData.type,
        htmlContent: validatedData.htmlContent,
        textContent: validatedData.textContent,
        designJson: validatedData.designJson,
        recipientCount,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        openTracking: validatedData.openTracking ?? true,
        clickTracking: validatedData.clickTracking ?? true,
        tenant: { connect: { id: user.tenantId } },
        provider: { connect: { id: validatedData.providerId } },
        template: validatedData.templateId ? { connect: { id: validatedData.templateId } } : undefined,
        lists: {
          create: validatedData.listIds.map(listId => ({
            list: { connect: { id: listId } },
          })),
        },
      },
      include: {
        provider: true,
        template: true,
        lists: {
          include: {
            list: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_TENANT',
        resource: 'EmailCampaign',
        resourceId: campaign.id,
        metadata: {
          campaignName: campaign.name,
          type: campaign.type,
          recipientCount,
        },
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({
      campaign: {
        ...campaign,
        lists: campaign.lists.map(cl => cl.list),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
} 