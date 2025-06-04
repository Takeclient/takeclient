'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GMBReview {
  id: string;
  accountId: string;
  locationId?: string;
  reviewerName: string;
  reviewerPhoto?: string;
  rating: number;
  comment?: string;
  reviewTime: Date;
  replyText?: string;
  replyTime?: Date;
  status: string;
  sentiment?: string;
  tags: string[];
  isStarred: boolean;
}

interface ReviewStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  replied: number;
  starred: number;
}

export default function GMBReviewsPage() {
  const [reviews, setReviews] = useState<GMBReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    rating: '',
    sentiment: '',
    starred: false
  });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<GMBReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.sentiment) params.append('sentiment', filters.sentiment);
      if (filters.starred) params.append('starred', 'true');

      const response = await fetch(`/api/marketing/gmb/reviews?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToReview = (review: GMBReview) => {
    setSelectedReview(review);
    setReplyText(review.replyText || '');
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    setSubmittingReply(true);
    
    try {
      const response = await fetch('/api/marketing/gmb/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          replyText: replyText.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      const data = await response.json();
      
      // Update the review in the list
      setReviews(prev => prev.map(review => 
        review.id === selectedReview.id 
          ? { ...review, replyText: replyText.trim(), replyTime: new Date() }
          : review
      ));

      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText('');
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleStarReview = async (reviewId: string, isStarred: boolean) => {
    try {
      const response = await fetch('/api/marketing/gmb/reviews', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isStarred: !isStarred
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      // Update the review in the list
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, isStarred: !isStarred }
          : review
      ));
      
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-100';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-100';
      case 'NEUTRAL':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
            <p className="text-gray-600 mt-1">Monitor and respond to your Google My Business reviews</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/marketing/gmb"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to GMB
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-star text-2xl text-yellow-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-chart-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-reply text-2xl text-blue-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Replied</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.replied}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <i className="fas fa-bookmark text-2xl text-purple-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Starred</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.starred}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="starred"
              checked={filters.starred}
              onChange={(e) => setFilters(prev => ({ ...prev, starred: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="starred" className="ml-2 text-sm font-medium text-gray-700">
              Show only starred
            </label>
          </div>

          <button
            onClick={() => setFilters({ rating: '', sentiment: '', starred: false })}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-6"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reviews ({reviews.length})</h2>
        </div>
        
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-star text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No reviews found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {review.reviewerPhoto ? (
                        <img 
                          src={review.reviewerPhoto} 
                          alt={review.reviewerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-gray-500"></i>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                        {renderStars(review.rating)}
                        {review.sentiment && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                            {review.sentiment}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(review.reviewTime)}
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}
                      
                      {review.replyText && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <i className="fas fa-reply text-blue-600 text-sm"></i>
                            <span className="text-sm font-medium text-blue-900">Your Reply</span>
                            {review.replyTime && (
                              <span className="text-sm text-blue-700">
                                {formatDate(review.replyTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-800">{review.replyText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStarReview(review.id, review.isStarred)}
                      className={`p-2 rounded-md ${
                        review.isStarred 
                          ? 'text-yellow-600 hover:text-yellow-700' 
                          : 'text-gray-400 hover:text-yellow-600'
                      }`}
                    >
                      <i className={`fas fa-bookmark ${review.isStarred ? '' : 'far'}`}></i>
                    </button>
                    
                    <button
                      onClick={() => handleReplyToReview(review)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-reply mr-1"></i>
                      {review.replyText ? 'Edit Reply' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReview.replyText ? 'Edit Reply' : 'Reply to Review'}
                </h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Original Review */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-gray-900">{selectedReview.reviewerName}</span>
                  {renderStars(selectedReview.rating)}
                </div>
                {selectedReview.comment && (
                  <p className="text-gray-700">{selectedReview.comment}</p>
                )}
              </div>
              
              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Thank you for your review..."
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                disabled={!replyText.trim() || submittingReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReply ? 'Submitting...' : 'Submit Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 