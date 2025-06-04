import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";

const updateMemberSchema = z.object({
  roleId: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, memberId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.EDIT_TEAMS) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateMemberSchema.parse(body);

    // Check if team exists and belongs to tenant
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        tenantId: user.tenantId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if member exists
    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId,
      },
      include: {
        user: true,
        role: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if new role exists and belongs to tenant
    const newRole = await prisma.teamRole.findFirst({
      where: {
        id: validatedData.roleId,
        tenantId: user.tenantId,
      },
    });

    if (!newRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update member role
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        roleId: validatedData.roleId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        role: true,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      resource: "TeamMember",
      resourceId: memberId,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: { roleId: member.role.id },
      newValues: { roleId: validatedData.roleId },
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, memberId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.REMOVE_MEMBERS) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if team exists and belongs to tenant
    const team = await prisma.team.findFirst({
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

    // Check if member exists
    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Don't allow removing the team owner
    if (member.userId === team.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove team owner" },
        { status: 400 }
      );
    }

    // Don't allow removing the last member
    if (team._count.members <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last member of a team" },
        { status: 400 }
      );
    }

    // Delete the member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      resource: "TeamMember",
      resourceId: memberId,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: {
        teamId: teamId,
        userId: member.userId,
        email: member.user.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
} 