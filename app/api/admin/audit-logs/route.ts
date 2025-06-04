import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { hasPermission, Permission } from '@/app/lib/permissions';
import { getAuditLogs } from '@/app/lib/audit';
import { AuditAction } from '@prisma/client';

// GET - List audit logs (Super admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to view audit logs
    if (!hasPermission(user.role, Permission.VIEW_AUDIT_LOGS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId') || undefined;
    const tenantId = searchParams.get('tenantId') || undefined;
    const action = searchParams.get('action') as AuditAction || undefined;
    const resource = searchParams.get('resource') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const result = await getAuditLogs({
      page,
      limit,
      userId,
      tenantId,
      action,
      resource,
      startDate,
      endDate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 