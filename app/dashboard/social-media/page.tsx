'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SocialMediaStats {
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
}

interface SocialPost {
  id: string;
  platform: string | { id: string; name: string; displayName: string; icon: string; color: string };
  content: string;
  mediaUrl?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'bg-black' },
  { id: 'snapchat', name: 'Snapchat', icon: 'fa-brands fa-snapchat', color: 'bg-yellow-400' },
];

export default function SocialMediaPage() {
  const searchParams = useSearchParams();
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || 'all');
  const [stats, setStats] = useState<Record<string, SocialMediaStats>>({});
  const [recentPosts, setRecentPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialMediaData();
  }, [selectedPlatform]);

  const fetchSocialMediaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch(`/api/social-media/analytics?platform=${selectedPlatform}&timeRange=30d`);
      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const analyticsData = await analyticsResponse.json();
      
      // Fetch recent posts
      const postsResponse = await fetch(`/api/social-media/posts?platform=${selectedPlatform}&limit=5`);
      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts data');
      }
      const postsData = await postsResponse.json();
      
      // Process analytics data
      if (selectedPlatform === 'all') {
        const aggregatedStats: Record<string, SocialMediaStats> = {};
        Object.entries(analyticsData.data).forEach(([platform, data]: [string, any]) => {
          aggregatedStats[platform] = {
            followers: data.metrics.followers.current,
            following: data.metrics.following?.current || 0,
            posts: data.metrics.posts.current,
            engagement: data.metrics.engagement.current,
            reach: data.metrics.reach.current,
            impressions: data.metrics.impressions.current
          };
        });
        setStats(aggregatedStats);
      } else {
        const platformData = analyticsData.data;
        setStats({
          [selectedPlatform]: {
            followers: platformData.metrics.followers.current,
            following: platformData.metrics.following?.current || 0,
            posts: platformData.metrics.posts.current,
            engagement: platformData.metrics.engagement.current,
            reach: platformData.metrics.reach.current,
            impressions: platformData.metrics.impressions.current
          }
        });
      }
      
      setRecentPosts(postsData.posts);
    } catch (error) {
      console.error('Error fetching social media data:', error);
      setError('Failed to load social media data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = () => {
    if (selectedPlatform === 'all') {
      return Object.values(stats).reduce((acc, platformStats) => ({
        followers: acc.followers + platformStats.followers,
        following: acc.following + platformStats.following,
        posts: acc.posts + platformStats.posts,
        engagement: acc.engagement + platformStats.engagement,
        reach: acc.reach + platformStats.reach,
        impressions: acc.impressions + platformStats.impressions
      }), { followers: 0, following: 0, posts: 0, engagement: 0, reach: 0, impressions: 0 });
    }
    return stats[selectedPlatform] || { followers: 0, following: 0, posts: 0, engagement: 0, reach: 0, impressions: 0 };
  };

  const getFilteredPosts = () => {
    if (selectedPlatform === 'all') return recentPosts;
    return recentPosts.filter(post => {
      const platformName = typeof post.platform === 'string' ? post.platform : post.platform.name;
      return platformName === selectedPlatform;
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformColor = (platform: string | { id: string; name: string; displayName: string; icon: string; color: string }) => {
    const platformName = typeof platform === 'string' ? platform : platform.name;
    const platformObj = platforms.find(p => p.id === platformName);
    return platformObj?.color || 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string | { id: string; name: string; displayName: string; icon: string; color: string }) => {
    const platformName = typeof platform === 'string' ? platform : platform.name;
    const platformObj = platforms.find(p => p.id === platformName);
    return platformObj?.icon || 'fa-share-alt';
  };

  const getPlatformDisplayName = (platform: string | { id: string; name: string; displayName: string; icon: string; color: string }) => {
    if (typeof platform === 'string') {
      const platformObj = platforms.find(p => p.id === platform);
      return platformObj?.name || platform;
    }
    return platform.displayName || platform.name;
  };

  const currentStats = getFilteredStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={fetchSocialMediaData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Management</h1>
            <p className="text-gray-600 mt-1">Manage all your social media platforms from one place</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/social-media/ai-agent"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-brain mr-2"></i>
              AI Agent
            </Link>
            <Link
              href="/dashboard/social-media/calendar"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              Calendar
            </Link>
            <Link
              href="/dashboard/social-media/auto-posting"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-robot mr-2"></i>
              Auto Post
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Platform</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              selectedPlatform === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-globe mr-2"></i>
            All Platforms
          </button>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                selectedPlatform === platform.id
                  ? `${platform.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`${platform.icon} mr-2`}></i>
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-2xl text-blue-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Followers</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(currentStats.followers)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-user-plus text-2xl text-green-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Following</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(currentStats.following)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-image text-2xl text-purple-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(currentStats.posts)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-heart text-2xl text-red-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">{currentStats.engagement.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-chart-line text-2xl text-orange-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Reach</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(currentStats.reach)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-eye text-2xl text-indigo-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Impressions</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(currentStats.impressions)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
            <Link
              href="/dashboard/social-media/calendar"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all posts
            </Link>
          </div>
        </div>
        <div className="p-6">
          {getFilteredPosts().length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-image text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No posts found for the selected platform.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredPosts().map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${getPlatformColor(post.platform)} rounded-full flex items-center justify-center`}>
                      <i className={`${getPlatformIcon(post.platform)} text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 capitalize">{getPlatformDisplayName(post.platform)}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'published' ? 'bg-green-100 text-green-800' :
                            post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 
                           post.scheduledAt ? `Scheduled for ${new Date(post.scheduledAt).toLocaleDateString()}` : 
                           'Draft'}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                      {post.status === 'published' && post.engagement && (
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span><i className="fas fa-heart mr-1"></i>{post.engagement.likes}</span>
                          <span><i className="fas fa-comment mr-1"></i>{post.engagement.comments}</span>
                          <span><i className="fas fa-share mr-1"></i>{post.engagement.shares}</span>
                          <span><i className="fas fa-eye mr-1"></i>{post.engagement.views}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link
          href="/dashboard/social-media/ai-agent"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-brain text-2xl text-purple-600"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">AI Agent</h3>
              <p className="text-sm text-gray-600">Smart automation & training</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/social-media/calendar"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-calendar-alt text-2xl text-blue-600"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
              <p className="text-sm text-gray-600">Plan and schedule posts</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/social-media/auto-posting"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-robot text-2xl text-green-600"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Auto Posting</h3>
              <p className="text-sm text-gray-600">Automate your posts</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/social-media/messages"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-comments text-2xl text-purple-600"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">Manage conversations</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/social-media/analytics"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-chart-line text-2xl text-orange-600"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View performance metrics</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 