import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions - allow if user has team management permissions or is admin
    const userPermissions = user.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.team_management.VIEW_TEAMS) && 
        user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions - allow if user has team creation permissions or is admin
    const userPermissions = user.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.team_management.CREATE_TEAMS) && 
        user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check tenant plan limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        plan: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check plan limits for teams
    const planFeatures = tenant.plan.features as any;
    const maxTeams = planFeatures?.maxTeams || 1;
    
    if (tenant._count.teams >= maxTeams) {
      return NextResponse.json(
        { error: `Your plan allows only ${maxTeams} team(s). Please upgrade to create more teams.` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = createTeamSchema.parse(body);

    // Check if team name already exists
    const existingTeam = await prisma.team.findUnique({
      where: {
        tenantId_name: {
          tenantId: user.tenantId,
          name: validatedData.name,
        },
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team name already exists" },
        { status: 400 }
      );
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        tenantId: user.tenantId,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Add the creator as the first team member with admin role
    const adminRole = await prisma.teamRole.findFirst({
      where: {
        tenantId: user.tenantId,
        name: "Administrator",
        isSystem: true,
      },
    });

    if (adminRole) {
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: session.user.id,
          roleId: adminRole.id,
          acceptedAt: new Date(),
        },
      });
    }

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      resource: "Team",
      resourceId: team.id,
      userId: session.user.id,
      tenantId: user.tenantId,
      newValues: { name: team.name, description: team.description },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
} 