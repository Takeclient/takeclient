import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';
import { Role } from '@prisma/client';
import { hasPermission, Permission } from '@/app/lib/permissions';
import { auditUserCreation, auditUserUpdate, auditUserDeletion } from '@/app/lib/audit';
import bcrypt from 'bcryptjs';

// Get request headers for audit logging
function getRequestInfo(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

// GET - List all users (Super admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Check if user has permission to manage all tenants (which includes users)
    if (!hasPermission(user.role, Permission.MANAGE_ALL_TENANTS)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const tenantId = searchParams.get('tenantId');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role;
    }

    if (tenantId) {
      if (tenantId === 'none') {
        where.tenantId = null;
      } else {
      where.tenantId = tenantId;
    }
    }

    // Get users with related data
    const users = await prisma.user.findMany({
        where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isSuperAdmin: true,
        isOwner: true,
        lastLoginAt: true,
        createdAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
                },
              },
            },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user (Super admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = session.user as any;
    
    // Check if user has permission to manage users
    if (!hasPermission(adminUser.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      name, 
      email, 
      password, 
      role, 
      tenantId, 
      isOwner, 
      isSuperAdmin,
      isActive = true 
    } = data;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, password, role' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 });
    }

    // Validate tenant exists if provided
    if (tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return NextResponse.json({ 
          error: 'Tenant not found' 
        }, { status: 404 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        tenantId,
        isOwner: isOwner || false,
        isSuperAdmin: isSuperAdmin || false,
        isActive,
        createdBy: adminUser.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestInfo(req);
    await auditUserCreation(
      newUser.id,
      newUser,
      adminUser.id,
      ipAddress,
      userAgent
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user (Super admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = session.user as any;
    
    // Check if user has permission to manage users
    if (!hasPermission(adminUser.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await req.json();
    const { 
      id, 
      name, 
      email, 
      password, 
      role, 
      tenantId, 
      isOwner, 
      isSuperAdmin,
      isActive 
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userWithEmail) {
        return NextResponse.json({ 
          error: 'User with this email already exists' 
        }, { status: 409 });
      }
    }

    // Validate tenant exists if changing tenant
    if (tenantId && tenantId !== existingUser.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return NextResponse.json({ 
          error: 'Tenant not found' 
        }, { status: 404 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (tenantId !== undefined) updateData.tenantId = tenantId;
    if (isOwner !== undefined) updateData.isOwner = isOwner;
    if (isSuperAdmin !== undefined) updateData.isSuperAdmin = isSuperAdmin;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestInfo(req);
    await auditUserUpdate(
      id,
      existingUser,
      updateData,
      adminUser.id,
      ipAddress,
      userAgent
    );

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user (Super admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = session.user as any;
    
    // Check if user has permission to manage users
    if (!hasPermission(adminUser.role, Permission.MANAGE_SYSTEM)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === adminUser.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 });
    }

    // Get user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Audit log
    const { ipAddress, userAgent } = getRequestInfo(req);
    await auditUserDeletion(
      userToDelete,
      adminUser.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 