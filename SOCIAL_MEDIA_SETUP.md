# Social Media Management Setup Guide

This guide will help you set up the social media management features in your CRM system, including OAuth integrations for various platforms.

## Overview

The social media management system includes:
- **Platform Connections**: OAuth integration with Instagram, Facebook, Twitter, TikTok, Snapchat, LinkedIn, and YouTube
- **Content Management**: Create, schedule, and publish posts across platforms
- **Analytics**: Track performance metrics and engagement
- **Messaging**: Manage direct messages and conversations
- **Automation**: Auto-posting and content templates

## Database Setup

1. **Run the migration** to create the new social media tables:
```bash
npx prisma db push
```

2. **Seed the database** with social media platforms:
```bash
npx prisma db seed
```

## Platform OAuth Setup

### 1. Instagram Basic Display API

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app and add Instagram Basic Display product
3. Configure OAuth redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/instagram/callback`
4. Add your credentials to `.env`:
```bash
INSTAGRAM_CLIENT_ID="your-instagram-client-id"
INSTAGRAM_CLIENT_SECRET="your-instagram-client-secret"
```

**Required Permissions:**
- `user_profile` - Read user profile info
- `user_media` - Read user media

### 2. Facebook Graph API

1. Use the same app from Instagram setup
2. Add Facebook Login product
3. Configure OAuth redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/facebook/callback`
4. Add credentials to `.env`:
```bash
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

**Required Permissions:**
- `pages_show_list` - Access page list
- `pages_read_engagement` - Read page engagement
- `pages_manage_posts` - Manage page posts
- `pages_read_user_content` - Read page content

### 3. Twitter API v2

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Enable OAuth 2.0 in app settings
4. Add redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/twitter/callback`
5. Add credentials to `.env`:
```bash
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

**Required Scopes:**
- `tweet.read` - Read tweets
- `tweet.write` - Write tweets
- `users.read` - Read user information
- `offline.access` - Maintain connection

### 4. TikTok for Business API

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Apply for TikTok Login Kit
4. Add redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/tiktok/callback`
5. Add credentials to `.env`:
```bash
TIKTOK_CLIENT_ID="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
```

**Required Scopes:**
- `user.info.basic` - Basic user information
- `video.publish` - Upload videos

### 5. Snapchat Marketing API

1. Go to [Snap Kit Developer Portal](https://kit.snapchat.com/)
2. Create a new app
3. Enable Login Kit
4. Add redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/snapchat/callback`
5. Add credentials to `.env`:
```bash
SNAPCHAT_CLIENT_ID="your-snapchat-client-id"
SNAPCHAT_CLIENT_SECRET="your-snapchat-client-secret"
```

### 6. LinkedIn API

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add Sign In with LinkedIn product
4. Add redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/linkedin/callback`
5. Add credentials to `.env`:
```bash
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

**Required Scopes:**
- `r_liteprofile` - Read basic profile
- `r_emailaddress` - Read email address
- `w_member_social` - Share content

### 7. YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add redirect URI: `{YOUR_DOMAIN}/api/social-media/oauth/youtube/callback`
6. Add credentials to `.env`:
```bash
YOUTUBE_CLIENT_ID="your-google-client-id"
YOUTUBE_CLIENT_SECRET="your-google-client-secret"
```

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube.upload` - Upload videos
- `https://www.googleapis.com/auth/youtube` - Manage YouTube account

## Features Available

### 📅 Content Calendar
- Visual calendar interface for planning posts
- Drag-and-drop scheduling
- Multi-platform posting
- Content approval workflows

### 🤖 Auto Posting
- Template-based content generation
- Recurring post schedules
- Platform-specific optimization
- Variable content insertion

### 💬 Message Management
- Unified inbox for all platforms
- Real-time message synchronization
- Conversation labeling and filtering
- Quick response templates

### 📊 Analytics Dashboard
- Cross-platform performance metrics
- Engagement tracking
- Audience insights
- Custom reporting

### ⚙️ Settings & Configuration
- Platform connection management
- Posting preferences
- Notification settings
- Team permissions

## Testing the Integration

1. **Start the development server:**
```bash
npm run dev
```

2. **Navigate to Social Media section:**
Go to `http://localhost:3000/dashboard/social-media`

3. **Test platform connections:**
- Click on Settings → Platform Connections
- Try connecting a platform (Instagram recommended for testing)
- Verify the OAuth flow works correctly

4. **Test posting:**
- Create a new post in the Calendar section
- Schedule it for immediate or future posting
- Check if the post appears in your connected platform

## API Endpoints

### Core Endpoints
- `GET /api/social-media/platforms` - Get available platforms
- `GET /api/social-media/connections` - Get user connections
- `GET /api/social-media/posts` - Get posts with filtering
- `POST /api/social-media/posts` - Create new post
- `GET /api/social-media/analytics` - Get analytics data
- `GET /api/social-media/settings` - Get user settings
- `PUT /api/social-media/settings` - Update settings

### OAuth Endpoints
- `GET /api/social-media/oauth/{platform}` - Get OAuth URL
- `POST /api/social-media/oauth/{platform}` - Complete OAuth flow

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch:**
   - Ensure redirect URIs match exactly in platform settings
   - Check that `NEXTAUTH_URL` is set correctly

2. **Missing credentials:**
   - Verify all required environment variables are set
   - Check that credentials are valid and not expired

3. **API rate limits:**
   - Each platform has different rate limits
   - Implement proper retry logic and respect rate limits

4. **Webhook verification:**
   - Some platforms require webhook endpoints for real-time updates
   - Implement webhook handlers for message synchronization

### Platform-Specific Notes

**Instagram:**
- Requires Facebook app approval for production
- Limited to Basic Display API for personal accounts
- Business accounts need Instagram Graph API

**Twitter:**
- API v2 is preferred over v1.1
- Essential access tier has limited functionality
- Consider upgrading to higher tier for production

**TikTok:**
- Business API approval process can take time
- Video uploads have specific format requirements
- Limited access to personal accounts

**LinkedIn:**
- Company page access requires additional permissions
- Content posting has strict guidelines
- Marketing API requires partnership

## Production Considerations

1. **Environment Variables:**
   - Use secure environment variable management
   - Never commit secrets to version control
   - Rotate credentials regularly

2. **Rate Limiting:**
   - Implement proper rate limiting
   - Use queuing for bulk operations
   - Monitor API usage

3. **Error Handling:**
   - Implement robust error handling
   - Provide meaningful error messages
   - Log errors for debugging

4. **Data Privacy:**
   - Follow platform terms of service
   - Implement proper data retention policies
   - Respect user privacy settings

5. **Monitoring:**
   - Monitor API health and performance
   - Set up alerts for failed operations
   - Track usage metrics

## Support

For additional help:
1. Check platform-specific documentation
2. Review error logs in the application
3. Test with platform's API explorers
4. Contact platform support if needed

## Next Steps

After completing the setup:
1. Test all platform integrations
2. Configure team permissions
3. Set up monitoring and alerts
4. Train users on the features
5. Plan content strategy and workflows

---

**Note:** This is a comprehensive social media management system. Start with one or two platforms for testing, then gradually add more as needed. 