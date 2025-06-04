import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, Permission } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        tenantId: user.tenantId,
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                lastLoginAt: true,
              },
            },
            role: true,
          },
          orderBy: {
            joinedAt: "desc",
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.role, Permission.MANAGE_TEAM, user.permissions as string[])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        tenantId: user.tenantId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const body = await req.json();
    const validatedData = updateTeamSchema.parse(body);

    // Check if new name already exists
    if (validatedData.name && validatedData.name !== team.name) {
      const existingTeam = await (prisma as any).team.findFirst({
        where: {
          tenantId: user.tenantId,
          name: validatedData.name,
          NOT: {
            id: teamId,
          },
        },
      });

      if (existingTeam) {
        return NextResponse.json(
          { error: "Team name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedTeam = await (prisma as any).team.update({
      where: { id: teamId },
      data: validatedData,
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

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      resource: "Team",
      resourceId: team.id,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: { name: team.name, description: team.description },
      newValues: validatedData,
    });

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.role, Permission.MANAGE_TEAM, user.permissions as string[])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const team = await (prisma as any).team.findFirst({
      where: {
        id: teamId,
        tenantId: user.tenantId,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if team has members
    if (team._count.members > 0) {
      return NextResponse.json(
        { error: "Cannot delete team with active members" },
        { status: 400 }
      );
    }

    // Soft delete the team
    await (prisma as any).team.update({
      where: { id: teamId },
      data: { isActive: false },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      resource: "Team",
      resourceId: team.id,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: { name: team.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
} 