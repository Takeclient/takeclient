import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import prisma from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    
    // Get user profile with tenant information
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Format response
    const profileData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: null, // Phone field doesn't exist in current schema
      role: profile.role,
      isSuperAdmin: profile.isSuperAdmin,
      tenantId: profile.tenantId,
      tenantName: profile.tenant?.name,
      avatar: profile.image, // Use 'image' field instead of 'avatar'
      createdAt: profile.createdAt.toISOString(),
      lastLogin: profile.lastLoginAt?.toISOString(), // Use 'lastLoginAt' instead of 'lastLogin'
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();
    
    // Validate input
    const { name } = body;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
    }

    // Update user profile (only name for now since phone doesn't exist in schema)
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
      },
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    // Format response
    const profileData = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      phone: null, // Phone field doesn't exist in current schema
      role: updatedProfile.role,
      isSuperAdmin: updatedProfile.isSuperAdmin,
      tenantId: updatedProfile.tenantId,
      tenantName: updatedProfile.tenant?.name,
      avatar: updatedProfile.image, // Use 'image' field instead of 'avatar'
      createdAt: updatedProfile.createdAt.toISOString(),
      lastLogin: updatedProfile.lastLoginAt?.toISOString(), // Use 'lastLoginAt' instead of 'lastLogin'
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 