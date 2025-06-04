import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Mock platforms data - in production this would come from database
const mockPlatforms = [
  {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram',
    icon: 'fa-brands fa-instagram',
    color: '#E1306C',
    authType: 'OAUTH2',
    authEndpoint: 'https://api.instagram.com/oauth/authorize',
    tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
    apiBaseUrl: 'https://graph.instagram.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      messaging: true,
      analytics: true,
      stories: true,
      reels: true,
      shopping: true
    }
  },
  {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook',
    icon: 'fa-brands fa-facebook',
    color: '#1877F2',
    authType: 'OAUTH2',
    authEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
    apiBaseUrl: 'https://graph.facebook.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      messaging: true,
      analytics: true,
      pages: true,
      events: true,
      ads: true
    }
  },
  {
    id: 'twitter',
    name: 'twitter',
    displayName: 'X (Twitter)',
    icon: 'fa-brands fa-x-twitter',
    color: '#000000',
    authType: 'OAUTH2',
    authEndpoint: 'https://twitter.com/i/oauth2/authorize',
    tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    apiBaseUrl: 'https://api.twitter.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      messaging: true,
      analytics: true,
      threads: true,
      spaces: true,
      lists: true
    }
  },
  {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok',
    icon: 'fa-brands fa-tiktok',
    color: '#000000',
    authType: 'OAUTH2',
    authEndpoint: 'https://www.tiktok.com/auth/authorize/',
    tokenEndpoint: 'https://open-api.tiktok.com/oauth/access_token/',
    apiBaseUrl: 'https://open-api.tiktok.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      analytics: true,
      videos: true,
      music: true,
      effects: true
    }
  },
  {
    id: 'snapchat',
    name: 'snapchat',
    displayName: 'Snapchat',
    icon: 'fa-brands fa-snapchat',
    color: '#FFFC00',
    authType: 'OAUTH2',
    authEndpoint: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    tokenEndpoint: 'https://accounts.snapchat.com/accounts/oauth2/token',
    apiBaseUrl: 'https://adsapi.snapchat.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      analytics: true,
      stories: true,
      lenses: true,
      ads: true
    }
  },
  {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: 'fa-brands fa-linkedin',
    color: '#0A66C2',
    authType: 'OAUTH2',
    authEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
    apiBaseUrl: 'https://api.linkedin.com',
    isActive: true,
    supportedFeatures: {
      posting: true,
      messaging: true,
      analytics: true,
      pages: true,
      articles: true,
      events: true
    }
  },
  {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube',
    icon: 'fa-brands fa-youtube',
    color: '#FF0000',
    authType: 'OAUTH2',
    authEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
    isActive: true,
    supportedFeatures: {
      posting: true,
      analytics: true,
      videos: true,
      playlists: true,
      live: true,
      shorts: true
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Filter active platforms
    const platforms = mockPlatforms.filter(platform => platform.isActive);

    return NextResponse.json({ platforms });
  } catch (error) {
    console.error('Error fetching social media platforms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 