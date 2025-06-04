import { prisma } from "@/app/lib/prisma";
import { DEFAULT_TEAM_ROLES } from "@/app/lib/team-permissions";

export async function initializeTeamRolesForTenant(tenantId: string) {
  try {
    // Check if roles already exist for this tenant
    const existingRoles = await prisma.teamRole.count({
      where: { tenantId },
    });

    if (existingRoles === 0) {
      // Create default roles
      const roles = Object.entries(DEFAULT_TEAM_ROLES).map(([key, role], index) => ({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        tenantId,
        isSystem: true,
        sortOrder: index,
      }));

      await prisma.teamRole.createMany({
        data: roles,
      });

      console.log(`Created ${roles.length} default roles for tenant ${tenantId}`);
    }
  } catch (error) {
    console.error("Error initializing team roles:", error);
    // Don't throw - this is initialization, shouldn't break the main flow
  }
}

export async function getUserTeamPermissions(userId: string): Promise<string[]> {
  try {
    // Get user's direct permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { permissions: true },
    });

    let permissions: string[] = [];
    
    // Add direct user permissions if any
    if (user?.permissions && Array.isArray(user.permissions)) {
      permissions = [...user.permissions];
    }

    // Get permissions from all teams the user belongs to
    const teamMemberships = await prisma.teamMember.findMany({
      where: {
        userId,
        isActive: true,
        team: {
          isActive: true,
        },
      },
      include: {
        role: {
          select: {
            permissions: true,
          },
        },
      },
    });

    // Merge all team role permissions
    teamMemberships.forEach(membership => {
      if (membership.role.permissions && Array.isArray(membership.role.permissions)) {
        permissions = [...permissions, ...membership.role.permissions];
      }
    });

    // Return unique permissions
    return [...new Set(permissions)];
  } catch (error) {
    console.error("Error getting user team permissions:", error);
    return [];
  }
}

export async function checkUserTeamPermission(
  userId: string, 
  permission: string
): Promise<boolean> {
  const permissions = await getUserTeamPermissions(userId);
  return permissions.includes(permission);
}

export async function checkUserTeamPermissions(
  userId: string, 
  requiredPermissions: string[],
  requireAll = true
): Promise<boolean> {
  const permissions = await getUserTeamPermissions(userId);
  
  if (requireAll) {
    return requiredPermissions.every(p => permissions.includes(p));
  } else {
    return requiredPermissions.some(p => permissions.includes(p));
  }
} 