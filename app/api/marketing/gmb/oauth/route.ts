import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Google My Business OAuth configuration
const GMB_OAUTH_CONFIG = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scope: [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/plus.business.manage',
    'profile',
    'email'
  ].join(' '),
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent'
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get OAuth credentials from environment variables
    const clientId = process.env.GOOGLE_GMB_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/marketing/gmb/oauth/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Google My Business OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = `${session.user.tenantId}:${session.user.id}:${Date.now()}`;

    // Build OAuth URL
    const authUrl = new URL(GMB_OAUTH_CONFIG.authUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', GMB_OAUTH_CONFIG.scope);
    authUrl.searchParams.set('response_type', GMB_OAUTH_CONFIG.responseType);
    authUrl.searchParams.set('access_type', GMB_OAUTH_CONFIG.accessType);
    authUrl.searchParams.set('prompt', GMB_OAUTH_CONFIG.prompt);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ 
      authUrl: authUrl.toString(),
      state,
      scope: GMB_OAUTH_CONFIG.scope
    });
  } catch (error) {
    console.error('Error generating GMB OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
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
    const { code, state } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      );
    }

    // Verify state parameter
    const [tenantId, userId, timestamp] = state?.split(':') || [];
    if (tenantId !== session.user.tenantId || userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const clientId = process.env.GOOGLE_GMB_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_GMB_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/marketing/gmb/oauth/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google My Business OAuth not configured' },
        { status: 500 }
      );
    }

    // TODO: Implement real token exchange with Google
    // For now, return mock token data
    const mockTokenData = {
      access_token: `gmb_access_${Date.now()}`,
      refresh_token: `gmb_refresh_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: GMB_OAUTH_CONFIG.scope
    };

    // TODO: Fetch user's Google My Business accounts
    // For now, return mock account data
    const mockAccountData = {
      id: `google_account_${Date.now()}`,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.image,
      businesses: [
        {
          name: 'Sample Business',
          address: '123 Main St, City, State 12345',
          phone: '+1-555-123-4567',
          website: 'https://example.com',
          category: 'Restaurant',
          placeId: `place_${Date.now()}`
        }
      ]
    };

    return NextResponse.json({
      success: true,
      tokenData: mockTokenData,
      accountData: mockAccountData,
      message: 'Google My Business authentication successful'
    });
  } catch (error) {
    console.error('Error processing GMB OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete authentication' },
      { status: 500 }
    );
  }
} 