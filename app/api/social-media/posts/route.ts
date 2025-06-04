import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Temporary in-memory storage for posts
// In production, this would use the database
let postsStorage: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter posts by tenant and other criteria
    let filteredPosts = postsStorage.filter(post => post.tenantId === session.user.tenantId);

    if (platform && platform !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.platform.name === platform);
    }

    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status.toLowerCase() === status.toLowerCase());
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const posts = filteredPosts.slice(offset, offset + limit);
    const total = filteredPosts.length;

    return NextResponse.json({ posts, total, limit, offset });
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      content, 
      mediaUrls = [], 
      hashTags = [], 
      mentions = [],
      connectionId,
      scheduledAt,
      publishNow = false
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get platform from connectionId (extract platform name)
    const platformName = connectionId.replace('mock_connection_', '');
    
    // Platform data for transformation
    const platformData = {
      id: platformName,
      name: platformName,
      displayName: platformName.charAt(0).toUpperCase() + platformName.slice(1),
      icon: `fa-brands fa-${platformName}`,
      color: platformName === 'instagram' ? '#E1306C' : 
             platformName === 'facebook' ? '#1877F2' :
             platformName === 'twitter' ? '#000000' :
             platformName === 'tiktok' ? '#000000' :
             platformName === 'snapchat' ? '#FFFC00' :
             platformName === 'linkedin' ? '#0A66C2' :
             platformName === 'youtube' ? '#FF0000' : '#333333'
    };

    // Determine post status
    let postStatus = 'draft';
    if (publishNow) {
      postStatus = 'published';
    } else if (scheduledAt) {
      postStatus = 'scheduled';
    }

    // Create the post object
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      content,
      mediaUrls,
      hashTags,
      mentions,
      status: postStatus,
      publishedAt: publishNow ? new Date() : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      engagement: publishNow ? { likes: 0, comments: 0, shares: 0, views: 0 } : null,
      reach: publishNow ? 0 : null,
      impressions: publishNow ? 0 : null,
      createdAt: new Date(),
      tenantId: session.user.tenantId,
      platform: platformData,
      connection: {
        id: connectionId,
        accountName: `${platformData.displayName} Account`,
        accountHandle: `@${platformName}_account`
      },
      creator: {
        name: session.user.name || 'Unknown User',
        email: session.user.email
      }
    };

    // Store the post
    postsStorage.push(newPost);

    if (publishNow) {
      console.log('Post published immediately:', newPost.id);
    } else if (scheduledAt) {
      console.log('Post scheduled for:', scheduledAt);
    }

    return NextResponse.json({ 
      success: true, 
      post: newPost,
      message: publishNow ? 'Post published successfully' : scheduledAt ? 'Post scheduled successfully' : 'Draft saved'
    });
  } catch (error) {
    console.error('Error creating social media post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    const postIndex = postsStorage.findIndex(post => 
      post.id === id && post.tenantId === session.user.tenantId
    );

    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update the post
    postsStorage[postIndex] = {
      ...postsStorage[postIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return NextResponse.json({ 
      success: true, 
      post: postsStorage[postIndex],
      message: 'Post updated successfully' 
    });
  } catch (error) {
    console.error('Error updating social media post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
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
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const postIndex = postsStorage.findIndex(post => 
      post.id === postId && post.tenantId === session.user.tenantId
    );

    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Remove the post
    postsStorage.splice(postIndex, 1);

    return NextResponse.json({ 
      success: true,
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting social media post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 