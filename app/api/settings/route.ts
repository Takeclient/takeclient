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
    
    // Get user settings (for now, return default settings since we don't have a settings table)
    const defaultSettings = {
      notifications: {
        email: true,
        browser: true,
        marketing: false,
      },
      privacy: {
        profileVisible: true,
        activityVisible: false,
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
      },
    };

    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
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
    
    // For now, just return success since we don't have a settings table
    // In a real implementation, you would save these to a UserSettings table
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 