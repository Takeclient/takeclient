import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

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

    // Get pipeline with stages
    const pipeline = await prisma.pipeline.findFirst({
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

    if (!pipeline) {
      return NextResponse.json({
        totalContacts: 0,
        totalStages: 0,
        recentActivity: 0,
        stageDistribution: {},
      });
    }

    // Get contacts for each stage
    const stagesWithCounts = await Promise.all(
      pipeline.contactStages.map(async (stage) => {
        const contactCount = await prisma.contact.count({
          where: {
            tenantId: user.tenantId,
            stageId: stage.id,
          },
        });
        return {
          ...stage,
          contactCount,
        };
      })
    );

    // Calculate stats
    const totalContacts = stagesWithCounts.reduce((total: number, stage: any) => total + stage.contactCount, 0);
    const totalStages = pipeline.contactStages.length;

    // Get recent activity (contacts created or updated in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.contact.count({
      where: {
        tenantId: user.tenantId,
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
    });

    // Build stage distribution
    const stageDistribution: any = {};
    stagesWithCounts.forEach((stage: any) => {
      stageDistribution[stage.id] = {
        name: stage.name,
        count: stage.contactCount,
        color: stage.color,
      };
    });

    return NextResponse.json({
      totalContacts,
      totalStages,
      recentActivity,
      stageDistribution,
    });
  } catch (error) {
    console.error('Error fetching contact pipeline stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 