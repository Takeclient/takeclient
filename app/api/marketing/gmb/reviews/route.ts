import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Temporary in-memory storage for GMB reviews
// In production, this would use the database
let gmbReviewsStorage: any[] = [
  // Mock reviews for demonstration
  {
    id: 'review_1',
    accountId: 'gmb_demo_account',
    locationId: 'location_1',
    googleReviewId: 'google_review_1',
    reviewerName: 'John Smith',
    reviewerPhoto: 'https://via.placeholder.com/50',
    rating: 5,
    comment: 'Excellent service! The staff was very friendly and helpful. Highly recommend this place.',
    reviewTime: new Date('2024-01-15T10:30:00'),
    isReply: false,
    replyText: 'Thank you for your wonderful review! We appreciate your business.',
    replyTime: new Date('2024-01-15T14:20:00'),
    status: 'PUBLISHED',
    sentiment: 'POSITIVE',
    tags: ['excellent', 'staff', 'friendly'],
    isStarred: false,
    lastSync: new Date(),
    tenantId: 'demo_tenant',
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T14:20:00')
  },
  {
    id: 'review_2',
    accountId: 'gmb_demo_account',
    locationId: 'location_1',
    googleReviewId: 'google_review_2',
    reviewerName: 'Sarah Johnson',
    reviewerPhoto: 'https://via.placeholder.com/50',
    rating: 4,
    comment: 'Good experience overall. The food was tasty but the wait time was a bit long.',
    reviewTime: new Date('2024-01-12T18:45:00'),
    isReply: false,
    replyText: null,
    replyTime: null,
    status: 'PUBLISHED',
    sentiment: 'POSITIVE',
    tags: ['good', 'food', 'wait time'],
    isStarred: false,
    lastSync: new Date(),
    tenantId: 'demo_tenant',
    createdAt: new Date('2024-01-12T18:45:00'),
    updatedAt: new Date('2024-01-12T18:45:00')
  },
  {
    id: 'review_3',
    accountId: 'gmb_demo_account',
    locationId: 'location_1',
    googleReviewId: 'google_review_3',
    reviewerName: 'Mike Davis',
    reviewerPhoto: null,
    rating: 2,
    comment: 'Not satisfied with the service. The order was wrong and staff seemed unprofessional.',
    reviewTime: new Date('2024-01-10T12:15:00'),
    isReply: false,
    replyText: 'We apologize for the poor experience. Please contact us directly so we can make this right.',
    replyTime: new Date('2024-01-10T16:30:00'),
    status: 'PUBLISHED',
    sentiment: 'NEGATIVE',
    tags: ['unsatisfied', 'wrong order', 'unprofessional'],
    isStarred: true,
    lastSync: new Date(),
    tenantId: 'demo_tenant',
    createdAt: new Date('2024-01-10T12:15:00'),
    updatedAt: new Date('2024-01-10T16:30:00')
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const locationId = searchParams.get('locationId');
    const rating = searchParams.get('rating');
    const sentiment = searchParams.get('sentiment');
    const starred = searchParams.get('starred');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter reviews by tenant and other criteria
    let filteredReviews = gmbReviewsStorage.filter(review => 
      review.tenantId === session.user.tenantId
    );

    if (accountId) {
      filteredReviews = filteredReviews.filter(review => review.accountId === accountId);
    }

    if (locationId) {
      filteredReviews = filteredReviews.filter(review => review.locationId === locationId);
    }

    if (rating) {
      filteredReviews = filteredReviews.filter(review => review.rating === parseInt(rating));
    }

    if (sentiment) {
      filteredReviews = filteredReviews.filter(review => 
        review.sentiment?.toLowerCase() === sentiment.toLowerCase()
      );
    }

    if (starred === 'true') {
      filteredReviews = filteredReviews.filter(review => review.isStarred);
    }

    // Sort by review time (newest first)
    filteredReviews.sort((a, b) => new Date(b.reviewTime).getTime() - new Date(a.reviewTime).getTime());

    const reviews = filteredReviews.slice(offset, offset + limit);
    const total = filteredReviews.length;

    // Calculate review statistics
    const stats = {
      total: filteredReviews.length,
      averageRating: filteredReviews.length > 0 
        ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length 
        : 0,
      ratingDistribution: {
        5: filteredReviews.filter(r => r.rating === 5).length,
        4: filteredReviews.filter(r => r.rating === 4).length,
        3: filteredReviews.filter(r => r.rating === 3).length,
        2: filteredReviews.filter(r => r.rating === 2).length,
        1: filteredReviews.filter(r => r.rating === 1).length
      },
      sentiment: {
        positive: filteredReviews.filter(r => r.sentiment === 'POSITIVE').length,
        negative: filteredReviews.filter(r => r.sentiment === 'NEGATIVE').length,
        neutral: filteredReviews.filter(r => r.sentiment === 'NEUTRAL').length
      },
      replied: filteredReviews.filter(r => r.replyText).length,
      starred: filteredReviews.filter(r => r.isStarred).length
    };

    return NextResponse.json({ reviews, stats, total, limit, offset });
  } catch (error) {
    console.error('Error fetching GMB reviews:', error);
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
    const { reviewId, replyText } = body;

    if (!reviewId || !replyText) {
      return NextResponse.json(
        { error: 'Review ID and reply text are required' },
        { status: 400 }
      );
    }

    const reviewIndex = gmbReviewsStorage.findIndex(review => 
      review.id === reviewId && review.tenantId === session.user.tenantId
    );

    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update the review with reply
    gmbReviewsStorage[reviewIndex] = {
      ...gmbReviewsStorage[reviewIndex],
      replyText,
      replyTime: new Date(),
      updatedAt: new Date()
    };

    // TODO: Send reply to Google My Business API

    return NextResponse.json({ 
      success: true, 
      review: gmbReviewsStorage[reviewIndex],
      message: 'Reply posted successfully' 
    });
  } catch (error) {
    console.error('Error posting review reply:', error);
    return NextResponse.json(
      { error: 'Failed to post reply' },
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
    const { reviewId, isStarred, tags } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const reviewIndex = gmbReviewsStorage.findIndex(review => 
      review.id === reviewId && review.tenantId === session.user.tenantId
    );

    if (reviewIndex === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update review metadata
    const updateData: any = { updatedAt: new Date() };
    if (typeof isStarred === 'boolean') updateData.isStarred = isStarred;
    if (tags) updateData.tags = tags;

    gmbReviewsStorage[reviewIndex] = {
      ...gmbReviewsStorage[reviewIndex],
      ...updateData
    };

    return NextResponse.json({ 
      success: true, 
      review: gmbReviewsStorage[reviewIndex],
      message: 'Review updated successfully' 
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
} 