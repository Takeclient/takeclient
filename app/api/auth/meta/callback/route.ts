import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('Meta OAuth error:', error, error_description);
      const errorUrl = new URL('/dashboard/ads/meta', request.nextUrl.origin);
      errorUrl.searchParams.set('error', error);
      errorUrl.searchParams.set('error_description', error_description || 'Authentication failed');
      return NextResponse.redirect(errorUrl);
    }

    // Handle missing authorization code
    if (!code) {
      console.error('No authorization code received from Meta');
      const errorUrl = new URL('/dashboard/ads/meta', request.nextUrl.origin);
      errorUrl.searchParams.set('error', 'missing_code');
      errorUrl.searchParams.set('error_description', 'No authorization code received');
      return NextResponse.redirect(errorUrl);
    }

    console.log('Meta OAuth callback received:', { code: code.substring(0, 10) + '...', state });

    // Exchange code for token via backend
    const tokenResponse = await fetch(`${BACKEND_URL}/api/v1/meta-ads/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Backend token exchange failed:', errorData);
      
      const errorUrl = new URL('/dashboard/ads/meta', request.nextUrl.origin);
      errorUrl.searchParams.set('error', 'token_exchange_failed');
      errorUrl.searchParams.set('error_description', errorData.detail || 'Failed to exchange authorization code');
      return NextResponse.redirect(errorUrl);
    }

    const tokenData = await tokenResponse.json();
    console.log('Meta token exchange successful:', {
      success: tokenData.success,
      user: tokenData.user?.name,
      accounts: tokenData.ad_accounts?.length
    });

    // Redirect to Meta Ads dashboard with success
    const successUrl = new URL('/dashboard/ads/meta', request.nextUrl.origin);
    successUrl.searchParams.set('auth', 'success');
    successUrl.searchParams.set('user', tokenData.user?.name || 'Unknown');
    
    if (tokenData.access_token) {
      // Store token in URL params for the frontend to handle
      // In production, you might want to store this more securely
      successUrl.searchParams.set('access_token', tokenData.access_token);
    }

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Meta OAuth callback error:', error);
    
    const errorUrl = new URL('/dashboard/ads/meta', request.nextUrl.origin);
    errorUrl.searchParams.set('error', 'callback_error');
    errorUrl.searchParams.set('error_description', 'An unexpected error occurred during authentication');
    return NextResponse.redirect(errorUrl);
  }
} 