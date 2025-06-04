import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// OAuth configuration for different platforms
const OAUTH_CONFIG = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scope: 'user_profile,user_media',
    responseType: 'code'
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content',
    responseType: 'code'
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.read tweet.write users.read offline.access',
    responseType: 'code'
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    scope: 'user.info.basic,video.publish',
    responseType: 'code'
  },
  snapchat: {
    authUrl: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    scope: 'snapchat-marketing-api',
    responseType: 'code'
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'r_liteprofile,r_emailaddress,w_member_social',
    responseType: 'code'
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    responseType: 'code'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const platform = params.platform;
    const config = OAUTH_CONFIG[platform as keyof typeof OAUTH_CONFIG];

    if (!config) {
      return NextResponse.json(
        { error: 'Platform not supported' },
        { status: 400 }
      );
    }

    // Get or create client credentials from environment variables
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/social-media/oauth/${platform}/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Platform not configured' },
        { status: 500 }
      );
    }

    // Build OAuth URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', config.scope);
    authUrl.searchParams.set('response_type', config.responseType);
    authUrl.searchParams.set('state', `${session.user.tenantId}:${session.user.id}`);

    return NextResponse.json({ 
      authUrl: authUrl.toString(),
      platform,
      scope: config.scope
    });
  } catch (error) {
    console.error(`Error generating OAuth URL for ${params.platform}:`, error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, state } = body;
    const platform = params.platform;

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      );
    }

    // Verify state parameter
    const [tenantId, userId] = state?.split(':') || [];
    if (tenantId !== session.user.tenantId || userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    // TODO: Implement real OAuth token exchange
    // This would involve:
    // 1. Exchange authorization code for access token
    // 2. Fetch user profile from the platform
    // 3. Store connection in database

    // For now, return mock connection data
    const mockConnection = {
      id: `conn_${platform}_${Date.now()}`,
      platformId: platform,
      accountId: `${platform}_account_${Date.now()}`,
      accountName: `Connected ${platform} Account`,
      accountHandle: `@${platform}_handle`,
      isActive: true,
      lastSync: new Date(),
      permissions: ['basic_read', 'publish_content'],
      status: 'active',
      platform: {
        name: platform,
        displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
        icon: `fa-brands fa-${platform}`,
        color: platform === 'instagram' ? '#E1306C' : 
               platform === 'facebook' ? '#1877F2' :
               platform === 'twitter' ? '#000000' :
               platform === 'tiktok' ? '#000000' :
               platform === 'snapchat' ? '#FFFC00' :
               platform === 'linkedin' ? '#0A66C2' :
               platform === 'youtube' ? '#FF0000' : '#333333'
      }
    };

    console.log(`Successfully connected ${platform} account:`, mockConnection.accountId);

    return NextResponse.json({
      success: true,
      connection: mockConnection,
      message: `${platform} account connected successfully`
    });
  } catch (error) {
    console.error(`Error connecting ${params.platform} account:`, error);
    return NextResponse.json(
      { error: 'Failed to connect account' },
      { status: 500 }
    );
  }
} 