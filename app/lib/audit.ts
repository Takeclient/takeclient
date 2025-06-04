import { AuditAction } from '@prisma/client';
import prisma from './prisma';

interface AuditLogData {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  userId: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: data.metadata,
        userId: data.userId,
        tenantId: data.tenantId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  userId?: string;
  tenantId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const {
    page = 1,
    limit = 50,
    userId,
    tenantId,
    action,
    resource,
    startDate,
    endDate,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (userId) where.userId = userId;
  if (tenantId) where.tenantId = tenantId;
  if (action) where.action = action;
  if (resource) where.resource = resource;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Helper functions for common audit operations
export async function auditUserCreation(
  userId: string,
  createdUser: any,
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.CREATE_USER,
    resource: 'user',
    resourceId: createdUser.id,
    newValues: {
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      tenantId: createdUser.tenantId,
    },
    userId: adminUserId,
    tenantId: createdUser.tenantId,
    ipAddress,
    userAgent,
  });
}

export async function auditUserUpdate(
  userId: string,
  oldValues: any,
  newValues: any,
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.UPDATE_USER,
    resource: 'user',
    resourceId: userId,
    oldValues,
    newValues,
    userId: adminUserId,
    tenantId: oldValues.tenantId || newValues.tenantId,
    ipAddress,
    userAgent,
  });
}

export async function auditUserDeletion(
  deletedUser: any,
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.DELETE_USER,
    resource: 'user',
    resourceId: deletedUser.id,
    oldValues: {
      name: deletedUser.name,
      email: deletedUser.email,
      role: deletedUser.role,
      tenantId: deletedUser.tenantId,
    },
    userId: adminUserId,
    tenantId: deletedUser.tenantId,
    ipAddress,
    userAgent,
  });
}

export async function auditTenantCreation(
  tenant: any,
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.CREATE_TENANT,
    resource: 'tenant',
    resourceId: tenant.id,
    newValues: {
      name: tenant.name,
      slug: tenant.slug,
      planId: tenant.planId,
    },
    userId: adminUserId,
    ipAddress,
    userAgent,
  });
}

export async function auditTenantUpdate(
  tenantId: string,
  oldValues: any,
  newValues: any,
  adminUserId: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.UPDATE_TENANT,
    resource: 'tenant',
    resourceId: tenantId,
    oldValues,
    newValues,
    userId: adminUserId,
    tenantId,
    ipAddress,
    userAgent,
  });
}

export async function auditLogin(
  userId: string,
  tenantId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.LOGIN,
    resource: 'auth',
    userId,
    tenantId,
    ipAddress,
    userAgent,
  });
}

export async function auditPermissionChange(
  targetUserId: string,
  oldRole: string,
  newRole: string,
  adminUserId: string,
  tenantId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  await createAuditLog({
    action: AuditAction.PERMISSION_CHANGE,
    resource: 'user',
    resourceId: targetUserId,
    oldValues: { role: oldRole },
    newValues: { role: newRole },
    userId: adminUserId,
    tenantId,
    ipAddress,
    userAgent,
  });
} 