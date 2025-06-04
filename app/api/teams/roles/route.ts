import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";
import { DEFAULT_TEAM_ROLES } from "@/app/lib/team-permissions";

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

export async function GET() {
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

    const roles = await prisma.teamRole.findMany({
      where: {
        tenantId: user.tenantId,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: [
        { isSystem: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching team roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch team roles" },
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

    // Check permissions
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.MANAGE_ROLES) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createRoleSchema.parse(body);

    // Check if role name already exists
    const existingRole = await prisma.teamRole.findFirst({
      where: {
        tenantId: user.tenantId,
        name: validatedData.name,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 400 }
      );
    }

    // Create the role
    const role = await prisma.teamRole.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        permissions: validatedData.permissions,
        tenantId: user.tenantId,
        isSystem: false,
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
      action: "CREATE",
      resource: "TeamRole",
      resourceId: role.id,
      userId: session.user.id,
      tenantId: user.tenantId,
      newValues: validatedData,
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating team role:", error);
    return NextResponse.json(
      { error: "Failed to create team role" },
      { status: 500 }
    );
  }
}

// Initialize default roles for a tenant
export async function initializeDefaultRoles(tenantId: string) {
  try {
    const existingRoles = await prisma.teamRole.count({
      where: { tenantId },
    });

    if (existingRoles > 0) {
      return; // Roles already initialized
    }

    const rolesToCreate = Object.entries(DEFAULT_TEAM_ROLES).map(([key, role], index) => ({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: true,
      sortOrder: index,
      tenantId,
    }));

    await prisma.teamRole.createMany({
      data: rolesToCreate,
    });

    console.log(`Initialized ${rolesToCreate.length} default team roles for tenant ${tenantId}`);
  } catch (error) {
    console.error("Error initializing default team roles:", error);
  }
} 