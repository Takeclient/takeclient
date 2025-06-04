import { prisma } from "@/app/lib/prisma";
import { AuditAction } from "@prisma/client";

interface CreateAuditLogParams {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  tenantId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const action = params.action.toUpperCase() as AuditAction;
    
    await prisma.auditLog.create({
      data: {
        action,
        resource: params.resource,
        resourceId: params.resourceId,
        userId: params.userId,
        tenantId: params.tenantId,
        oldValues: params.oldValues,
        newValues: params.newValues,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit log failures shouldn't break the main operation
  }
} 