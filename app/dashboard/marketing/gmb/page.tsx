'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GMBAccount {
  id: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  isVerified: boolean;
  isActive: boolean;
  lastSync?: Date;
  metadata?: any;
}

interface GMBStats {
  totalAccounts: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  totalActions: number;
  pendingReplies: number;
}

export default function GMBDashboardPage() {
  const [accounts, setAccounts] = useState<GMBAccount[]>([]);
  const [stats, setStats] = useState<GMBStats>({
    totalAccounts: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
    totalActions: 0,
    pendingReplies: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchGMBData();
  }, []);

  const fetchGMBData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch GMB accounts
      const accountsResponse = await fetch('/api/marketing/gmb/accounts');
      if (!accountsResponse.ok) {
        throw new Error('Failed to fetch GMB accounts');
      }
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData.accounts || []);

      // Calculate mock stats based on accounts
      const mockStats: GMBStats = {
        totalAccounts: accountsData.accounts?.length || 0,
        totalReviews: 127,
        averageRating: 4.2,
        totalViews: 2450,
        totalActions: 89,
        pendingReplies: 3
      };
      setStats(mockStats);

    } catch (error) {
      console.error('Error fetching GMB data:', error);
      setError('Failed to load Google My Business data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGMB = async () => {
    setConnecting(true);
    
    try {
      // Get OAuth URL
      const oauthResponse = await fetch('/api/marketing/gmb/oauth');
      if (!oauthResponse.ok) {
        throw new Error('Failed to get OAuth URL');
      }
      const oauthData = await oauthResponse.json();
      
      // Redirect to Google OAuth
      window.location.href = oauthData.authUrl;
      
    } catch (error) {
      console.error('Error connecting GMB:', error);
      alert('Failed to connect Google My Business. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
            <h1 className="text-2xl font-bold text-gray-900">Google My Business</h1>
            <p className="text-gray-600 mt-1">Manage your Google Business listings and customer interactions</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/marketing/gmb/ai-agent"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-brain mr-2"></i>
              AI Agent
            </Link>
            <button
              onClick={handleConnectGMB}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fab fa-google mr-2"></i>
              Connect GMB Account
            </button>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        // Empty state when no accounts connected
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fab fa-google text-2xl text-blue-600"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Google My Business</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by connecting your Google My Business account to manage reviews, posts, and insights all in one place.
          </p>
          <button
            onClick={handleConnectGMB}
            disabled={connecting}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Google My Business'}
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-store text-2xl text-blue-600"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Connected Accounts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalAccounts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-star text-2xl text-yellow-500"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalReviews)}</p>
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
                  <i className="fas fa-eye text-2xl text-purple-600"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalViews)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-mouse-pointer text-2xl text-orange-600"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Customer Actions</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalActions)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-reply text-2xl text-red-600"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pending Replies</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingReplies}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link
              href="/dashboard/marketing/gmb/ai-agent"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-brain text-2xl text-purple-600"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">AI Agent</h3>
                  <p className="text-sm text-gray-600">Smart review management</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/marketing/gmb/reviews"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-star text-2xl text-yellow-500"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                  <p className="text-sm text-gray-600">Manage customer reviews</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/marketing/gmb/posts"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-bullhorn text-2xl text-blue-600"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
                  <p className="text-sm text-gray-600">Create and schedule posts</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/marketing/gmb/insights"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-chart-line text-2xl text-green-600"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
                  <p className="text-sm text-gray-600">View performance metrics</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/marketing/gmb/settings"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-cog text-2xl text-gray-600"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-600">Configure preferences</p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
} 