import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    // TODO: Implement real database query after migration
    // const settings = await prisma.socialMediaSettings.findFirst({
    //   where: {
    //     tenantId: session.user.tenantId,
    //     userId: session.user.id,
    //     ...(connectionId && { connectionId })
    //   }
    // });

    // Temporary mock settings data
    const mockSettings = {
      id: 'settings_1',
      autoPosting: true,
      postTiming: 'OPTIMAL',
      crossPosting: true,
      contentModeration: true,
      linkShortening: true,
      watermark: false,
      defaultHashtags: ['#business', '#marketing', '#growth'],
      mentionNotifications: true,
      dmNotifications: true,
      commentNotifications: true,
      postNotifications: true,
      failureNotifications: true,
      weeklyReports: true,
      monthlyReports: true,
      emailNotifications: true,
      pushNotifications: true
    };

    return NextResponse.json({ settings: mockSettings });
  } catch (error) {
    console.error('Error fetching social media settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, ...settingsData } = body;

    // TODO: Implement real database update after migration
    // const settings = await prisma.socialMediaSettings.upsert({
    //   where: {
    //     tenantId_userId_connectionId: {
    //       tenantId: session.user.tenantId,
    //       userId: session.user.id,
    //       connectionId: connectionId || null
    //     }
    //   },
    //   update: settingsData,
    //   create: {
    //     tenantId: session.user.tenantId,
    //     userId: session.user.id,
    //     connectionId: connectionId || null,
    //     ...settingsData
    //   }
    // });

    // Mock settings update
    const updatedSettings = {
      id: 'settings_1',
      ...settingsData,
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      settings: updatedSettings,
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating social media settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 