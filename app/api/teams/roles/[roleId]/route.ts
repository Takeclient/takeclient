import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    const role = await prisma.teamRole.findFirst({
      where: {
        id: roleId,
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

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.MANAGE_ROLES) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateRoleSchema.parse(body);

    // Check if role exists and belongs to tenant
    const existingRole = await prisma.teamRole.findFirst({
      where: {
        id: roleId,
        tenantId: user.tenantId,
      },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Don't allow editing system roles
    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: "System roles cannot be modified" },
        { status: 400 }
      );
    }

    // Check if new name conflicts with another role
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const conflictingRole = await prisma.teamRole.findFirst({
        where: {
          tenantId: user.tenantId,
          name: validatedData.name,
          NOT: {
            id: roleId,
          },
        },
      });

      if (conflictingRole) {
        return NextResponse.json(
          { error: "A role with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the role
    const updatedRole = await prisma.teamRole.update({
      where: { id: roleId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: validatedData.permissions,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "UPDATE",
      resource: "TeamRole",
      resourceId: roleId,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: {
        name: existingRole.name,
        description: existingRole.description,
        permissions: existingRole.permissions,
      },
      newValues: validatedData,
    });

    return NextResponse.json({ role: updatedRole });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true, tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 404 });
    }

    // Check permissions
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.MANAGE_ROLES) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if role exists and belongs to tenant
    const existingRole = await prisma.teamRole.findFirst({
      where: {
        id: roleId,
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

    if (!existingRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Don't allow deleting system roles
    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: "System roles cannot be deleted" },
        { status: 400 }
      );
    }

    // Don't allow deleting roles with members
    if (existingRole._count.members > 0) {
      return NextResponse.json(
        { error: "Cannot delete role with assigned members" },
        { status: 400 }
      );
    }

    // Delete the role
    await prisma.teamRole.delete({
      where: { id: roleId },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      resource: "TeamRole",
      resourceId: roleId,
      userId: session.user.id,
      tenantId: user.tenantId,
      oldValues: {
        name: existingRole.name,
        description: existingRole.description,
        permissions: existingRole.permissions,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
} 