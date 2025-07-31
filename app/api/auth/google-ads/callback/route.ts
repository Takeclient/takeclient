import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      const errorMessage = searchParams.get('error_description') || 'Authentication failed';
      return NextResponse.redirect(
        new URL(`/dashboard/ads/google?error=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        new URL('/dashboard/ads/google?error=No authorization code received', request.url)
      );
    }

    // Forward the code to the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/google-ads/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Backend authentication failed' }));
      console.error('Backend authentication error:', errorData);
      return NextResponse.redirect(
        new URL(`/dashboard/ads/google?error=${encodeURIComponent(errorData.detail || 'Authentication failed')}`, request.url)
      );
    }

    const tokenData = await response.json();
    
    // Store tokens in session/cookies (implement based on your auth strategy)
    // For now, we'll redirect with success
    console.log('Authentication successful:', tokenData);

    // Redirect back to Google Ads dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard/ads/google?connected=true', request.url)
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/ads/google?error=Authentication failed', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests if needed
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 