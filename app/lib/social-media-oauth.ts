// Social Media OAuth Utility Functions

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

interface PlatformProfile {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
}

export class SocialMediaOAuth {
  
  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    platform: string, 
    code: string, 
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`Missing OAuth credentials for ${platform}`);
    }

    switch (platform) {
      case 'instagram':
        return this.exchangeInstagramToken(code, clientId, clientSecret, redirectUri);
      case 'facebook':
        return this.exchangeFacebookToken(code, clientId, clientSecret, redirectUri);
      case 'twitter':
        return this.exchangeTwitterToken(code, clientId, clientSecret, redirectUri);
      case 'tiktok':
        return this.exchangeTikTokToken(code, clientId, clientSecret, redirectUri);
      case 'snapchat':
        return this.exchangeSnapchatToken(code, clientId, clientSecret, redirectUri);
      case 'linkedin':
        return this.exchangeLinkedInToken(code, clientId, clientSecret, redirectUri);
      case 'youtube':
        return this.exchangeYouTubeToken(code, clientId, clientSecret, redirectUri);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Get user profile from platform
   */
  static async getUserProfile(platform: string, accessToken: string): Promise<PlatformProfile> {
    switch (platform) {
      case 'instagram':
        return this.getInstagramProfile(accessToken);
      case 'facebook':
        return this.getFacebookProfile(accessToken);
      case 'twitter':
        return this.getTwitterProfile(accessToken);
      case 'tiktok':
        return this.getTikTokProfile(accessToken);
      case 'snapchat':
        return this.getSnapchatProfile(accessToken);
      case 'linkedin':
        return this.getLinkedInProfile(accessToken);
      case 'youtube':
        return this.getYouTubeProfile(accessToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Platform-specific token exchange methods
  private static async exchangeInstagramToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Instagram token exchange failed: ${error}`);
    }

    return response.json();
  }

  private static async exchangeFacebookToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // For now, return mock token
    return {
      access_token: `fb_token_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  private static async exchangeTwitterToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    // Twitter OAuth 2.0 token exchange
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: 'challenge', // In real implementation, store and retrieve this
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter token exchange failed: ${error}`);
    }

    return response.json();
  }

  private static async exchangeTikTokToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    // Mock TikTok token exchange
    return {
      access_token: `tiktok_token_${Date.now()}`,
      refresh_token: `tiktok_refresh_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 86400
    };
  }

  private static async exchangeSnapchatToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    // Mock Snapchat token exchange
    return {
      access_token: `snap_token_${Date.now()}`,
      refresh_token: `snap_refresh_${Date.now()}`,
      token_type: 'Bearer',
      expires_in: 3600
    };
  }

  private static async exchangeLinkedInToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return response.json();
  }

  private static async exchangeYouTubeToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube token exchange failed: ${error}`);
    }

    return response.json();
  }

  // Platform-specific profile fetch methods
  private static async getInstagramProfile(accessToken: string): Promise<PlatformProfile> {
    // Mock Instagram profile
    return {
      id: `ig_${Date.now()}`,
      name: 'Instagram User',
      username: 'instagram_user',
      avatar: 'https://via.placeholder.com/150',
      verified: false,
      followerCount: 1250,
      followingCount: 850,
      postCount: 342
    };
  }

  private static async getFacebookProfile(accessToken: string): Promise<PlatformProfile> {
    // Mock Facebook profile
    return {
      id: `fb_${Date.now()}`,
      name: 'Facebook Page',
      username: 'facebook_page',
      avatar: 'https://via.placeholder.com/150',
      verified: true,
      followerCount: 8900,
      followingCount: 120,
      postCount: 198
    };
  }

  private static async getTwitterProfile(accessToken: string): Promise<PlatformProfile> {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Fallback to mock data
      return {
        id: `tw_${Date.now()}`,
        name: 'Twitter User',
        username: 'twitter_user',
        verified: false,
        followerCount: 15600,
        followingCount: 1200,
        postCount: 890
      };
    }

    const data = await response.json();
    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      verified: data.data.verified || false,
    };
  }

  private static async getTikTokProfile(accessToken: string): Promise<PlatformProfile> {
    // Mock TikTok profile
    return {
      id: `tt_${Date.now()}`,
      name: 'TikTok User',
      username: 'tiktok_user',
      avatar: 'https://via.placeholder.com/150',
      verified: false,
      followerCount: 45000,
      followingCount: 200,
      postCount: 156
    };
  }

  private static async getSnapchatProfile(accessToken: string): Promise<PlatformProfile> {
    // Mock Snapchat profile
    return {
      id: `snap_${Date.now()}`,
      name: 'Snapchat User',
      username: 'snapchat_user',
      avatar: 'https://via.placeholder.com/150',
      verified: false,
      followerCount: 3200,
      followingCount: 450,
      postCount: 89
    };
  }

  private static async getLinkedInProfile(accessToken: string): Promise<PlatformProfile> {
    // Mock LinkedIn profile
    return {
      id: `li_${Date.now()}`,
      name: 'LinkedIn Profile',
      username: 'linkedin_user',
      avatar: 'https://via.placeholder.com/150',
      verified: true,
      followerCount: 5600,
      followingCount: 980,
      postCount: 234
    };
  }

  private static async getYouTubeProfile(accessToken: string): Promise<PlatformProfile> {
    const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Fallback to mock data
      return {
        id: `yt_${Date.now()}`,
        name: 'YouTube Channel',
        username: 'youtube_channel',
        verified: false,
        followerCount: 12300,
        followingCount: 45,
        postCount: 89
      };
    }

    const data = await response.json();
    const channel = data.items[0];
    
    return {
      id: channel.id,
      name: channel.snippet.title,
      username: channel.snippet.customUrl || channel.snippet.title,
      avatar: channel.snippet.thumbnails?.default?.url,
      verified: false, // YouTube doesn't provide verification status in basic API
      followerCount: parseInt(channel.statistics.subscriberCount) || 0,
      postCount: parseInt(channel.statistics.videoCount) || 0
    };
  }

  /**
   * Refresh access token if needed
   */
  static async refreshToken(platform: string, refreshToken: string): Promise<OAuthTokenResponse> {
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`Missing OAuth credentials for ${platform}`);
    }

    // Implementation would vary by platform
    // Most platforms support refresh token flow
    throw new Error('Refresh token not implemented yet');
  }
} 