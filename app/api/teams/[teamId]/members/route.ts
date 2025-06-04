import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/app/lib/permissions";
import { z } from "zod";
import { createAuditLog } from "@/app/lib/audit-log";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  roleId: z.string(),
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

    const members = await prisma.teamMember.findMany({
      where: {
        teamId: teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            lastLoginAt: true,
            isActive: true,
          },
        },
        role: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    if (!hasPermission(user.permissions, PERMISSIONS.team_management.INVITE_MEMBERS) &&
        user.role !== "SUPER_ADMIN" && user.role !== "TENANT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = inviteMemberSchema.parse(body);

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

    // Check tenant plan limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        plan: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check plan limits for team members
    const planFeatures = tenant.plan.features as any;
    const maxMembers = planFeatures?.maxTeamMembers || 5;
    
    if (team._count.members >= maxMembers) {
      return NextResponse.json(
        { error: `Your plan allows only ${maxMembers} members per team. Please upgrade to add more members.` },
        { status: 400 }
      );
    }

    // Check if user exists in the system
    let invitedUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // If user doesn't exist, create an inactive user account
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email: validatedData.email,
          tenantId: user.tenantId,
          isActive: false,
          role: "USER",
        },
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Check if role exists and belongs to tenant
    const role = await prisma.teamRole.findFirst({
      where: {
        id: validatedData.roleId,
        tenantId: user.tenantId,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Create team member
    const member = await prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: invitedUser.id,
        roleId: validatedData.roleId,
        invitedBy: session.user.id,
        invitedAt: new Date(),
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

    // TODO: Send invitation email

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      resource: "TeamMember",
      resourceId: member.id,
      userId: session.user.id,
      tenantId: user.tenantId,
      newValues: { 
        teamId: teamId,
        userId: invitedUser.id,
        email: validatedData.email,
        roleId: validatedData.roleId,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
} 