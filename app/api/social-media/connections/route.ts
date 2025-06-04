import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Temporary in-memory storage for connections
// In production, this would use the database
let connectionsStorage: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter connections by tenant
    const connections = connectionsStorage.filter(connection => 
      connection.tenantId === session.user.tenantId
    );

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching social media connections:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platformId, authCode, redirectUri, accountData } = body;

    if (!platformId || !authCode) {
      return NextResponse.json(
        { error: 'Platform ID and auth code are required' },
        { status: 400 }
      );
    }

    // Get platform data for the connection
    const platformDataMap: { [key: string]: any } = {
      instagram: {
        id: 'instagram',
        name: 'instagram',
        displayName: 'Instagram',
        icon: 'fa-brands fa-instagram',
        color: '#E1306C'
      },
      facebook: {
        id: 'facebook',
        name: 'facebook',
        displayName: 'Facebook',
        icon: 'fa-brands fa-facebook',
        color: '#1877F2'
      },
      twitter: {
        id: 'twitter',
        name: 'twitter',
        displayName: 'X (Twitter)',
        icon: 'fa-brands fa-x-twitter',
        color: '#000000'
      },
      tiktok: {
        id: 'tiktok',
        name: 'tiktok',
        displayName: 'TikTok',
        icon: 'fa-brands fa-tiktok',
        color: '#000000'
      },
      snapchat: {
        id: 'snapchat',
        name: 'snapchat',
        displayName: 'Snapchat',
        icon: 'fa-brands fa-snapchat',
        color: '#FFFC00'
      },
      linkedin: {
        id: 'linkedin',
        name: 'linkedin',
        displayName: 'LinkedIn',
        icon: 'fa-brands fa-linkedin',
        color: '#0A66C2'
      },
      youtube: {
        id: 'youtube',
        name: 'youtube',
        displayName: 'YouTube',
        icon: 'fa-brands fa-youtube',
        color: '#FF0000'
      }
    };

    const platformData = platformDataMap[platformId];
    if (!platformData) {
      return NextResponse.json(
        { error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    // TODO: Implement OAuth token exchange with the platform
    // For now, create a mock connection with the provided data
    const newConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      platformId,
      tenantId: session.user.tenantId,
      userId: session.user.id,
      accountId: accountData?.accountId || `account_${Date.now()}`,
      accountName: accountData?.accountName || `${platformData.displayName} Account`,
      accountHandle: accountData?.accountHandle || `@${platformId}_account`,
      accessToken: `token_${Date.now()}`, // This would be the real token from OAuth
      refreshToken: `refresh_${Date.now()}`,
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      scope: ['basic_read', 'publish_content'],
      permissions: ['basic_read', 'publish_content'],
      isActive: true,
      lastSync: new Date(),
      syncError: null,
      metadata: {
        connectedAt: new Date(),
        oauthCode: authCode
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      platform: platformData
    };

    // Store the connection
    connectionsStorage.push(newConnection);

    return NextResponse.json({ 
      success: true, 
      connection: newConnection,
      message: 'Platform connected successfully' 
    });
  } catch (error) {
    console.error('Error connecting social media platform:', error);
    return NextResponse.json(
      { error: 'Failed to connect platform' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const connectionIndex = connectionsStorage.findIndex(connection => 
      connection.id === connectionId && connection.tenantId === session.user.tenantId
    );

    if (connectionIndex === -1) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Remove the connection
    connectionsStorage.splice(connectionIndex, 1);

    return NextResponse.json({ 
      success: true,
      message: 'Connection removed successfully' 
    });
  } catch (error) {
    console.error('Error removing social media connection:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
} 