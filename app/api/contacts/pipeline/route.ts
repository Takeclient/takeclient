import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

// GET - Get contact pipeline for tenant
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

    // Get or create default pipeline
    let pipeline = await prisma.pipeline.findFirst({
      where: {
        tenantId: user.tenantId,
        type: 'CONTACT',
      },
      include: {
        contactStages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Create default pipeline if none exists
    if (!pipeline) {
      pipeline = await createDefaultContactPipeline(user.tenantId);
    }

    // Get contacts organized by stage
    const stages = await Promise.all(
      pipeline.contactStages.map(async (stage) => {
        const contacts = await prisma.contact.findMany({
          where: {
            tenantId: user.tenantId,
            stageId: stage.id,
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          id: stage.id,
          name: stage.name,
          color: stage.color,
          order: stage.order,
          contacts: contacts.map(contact => ({
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            status: contact.status,
            avatar: contact.avatar,
            jobTitle: contact.jobTitle,
            company: contact.company,
            leadScore: contact.leadScore,
            lastActivity: contact.lastActivity?.toISOString(),
            tags: contact.tags,
            createdAt: contact.createdAt.toISOString(),
          })),
        };
      })
    );

    return NextResponse.json({
      id: pipeline.id,
      name: pipeline.name,
      stages,
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new pipeline
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

    const { name, stages } = await req.json();

    if (!name || !stages || !Array.isArray(stages)) {
      return NextResponse.json({ error: 'Invalid pipeline data' }, { status: 400 });
    }

    // Create pipeline with stages
    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        type: 'CONTACT',
        tenantId: user.tenantId,
        contactStages: {
          create: stages.map((stage: any, index: number) => ({
            name: stage.name,
            description: stage.description,
            color: stage.color || '#3B82F6',
            order: index,
            tenantId: user.tenantId,
          })),
        },
      },
      include: {
        contactStages: true,
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to create default contact pipeline
async function createDefaultContactPipeline(tenantId: string) {
  const defaultStages = [
    { name: 'New Lead', color: '#3B82F6', order: 0 },
    { name: 'Qualified', color: '#10B981', order: 1 },
    { name: 'Contacted', color: '#F59E0B', order: 2 },
    { name: 'Interested', color: '#8B5CF6', order: 3 },
    { name: 'Proposal Sent', color: '#F97316', order: 4 },
    { name: 'Negotiation', color: '#EF4444', order: 5 },
    { name: 'Closed Won', color: '#059669', order: 6 },
    { name: 'Closed Lost', color: '#6B7280', order: 7 },
  ];

  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Default Contact Pipeline',
      type: 'CONTACT',
      isDefault: true,
      tenantId,
      contactStages: {
        create: defaultStages.map(stage => ({
          name: stage.name,
          color: stage.color,
          order: stage.order,
          isDefault: stage.order === 0,
          tenantId,
        })),
      },
    },
    include: {
      contactStages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return pipeline;
} 