'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  platform: string;
  metrics: {
    followers: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    engagement: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    reach: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    impressions: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    posts: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    engagementRate: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
  };
  topPosts: Array<{
    id: string;
    content: string;
    mediaUrl?: string;
    publishedAt: Date;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
    };
  }>;
  audienceInsights: {
    ageGroups: Array<{ range: string; percentage: number }>;
    gender: Array<{ type: string; percentage: number }>;
    locations: Array<{ country: string; percentage: number }>;
    activeHours: Array<{ hour: number; engagement: number }>;
  };
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'bg-black' },
  { id: 'snapchat', name: 'Snapchat', icon: 'fa-brands fa-snapchat', color: 'bg-yellow-400' },
];

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' },
];

export default function SocialMediaAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<Record<string, AnalyticsData>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'audience'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPlatform, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock analytics data
      const mockAnalyticsData: Record<string, AnalyticsData> = {
        instagram: {
          platform: 'instagram',
          metrics: {
            followers: { current: 12500, change: 5.2, trend: 'up' },
            engagement: { current: 2850, change: 12.8, trend: 'up' },
            reach: { current: 25000, change: -2.1, trend: 'down' },
            impressions: { current: 45000, change: 8.5, trend: 'up' },
            posts: { current: 24, change: 14.3, trend: 'up' },
            engagementRate: { current: 4.2, change: 0.8, trend: 'up' }
          },
          topPosts: [
            {
              id: '1',
              content: 'Check out our latest product launch! 🚀 #innovation #newproduct',
              mediaUrl: 'https://via.placeholder.com/400x400',
              publishedAt: new Date('2024-01-15T10:30:00'),
              engagement: { likes: 245, comments: 18, shares: 12, views: 1800 }
            },
            {
              id: '2',
              content: 'Behind the scenes of our creative process 📸',
              publishedAt: new Date('2024-01-12T14:20:00'),
              engagement: { likes: 189, comments: 24, shares: 8, views: 1450 }
            }
          ],
          audienceInsights: {
            ageGroups: [
              { range: '18-24', percentage: 32 },
              { range: '25-34', percentage: 28 },
              { range: '35-44', percentage: 22 },
              { range: '45-54', percentage: 12 },
              { range: '55+', percentage: 6 }
            ],
            gender: [
              { type: 'Female', percentage: 58 },
              { type: 'Male', percentage: 40 },
              { type: 'Other', percentage: 2 }
            ],
            locations: [
              { country: 'United States', percentage: 45 },
              { country: 'Canada', percentage: 18 },
              { country: 'United Kingdom', percentage: 12 },
              { country: 'Australia', percentage: 8 },
              { country: 'Other', percentage: 17 }
            ],
            activeHours: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              engagement: Math.floor(Math.random() * 100) + 20
            }))
          }
        },
        facebook: {
          platform: 'facebook',
          metrics: {
            followers: { current: 8900, change: 3.1, trend: 'up' },
            engagement: { current: 1890, change: -5.2, trend: 'down' },
            reach: { current: 18000, change: 15.6, trend: 'up' },
            impressions: { current: 32000, change: 7.3, trend: 'up' },
            posts: { current: 18, change: -10.0, trend: 'down' },
            engagementRate: { current: 3.8, change: -0.4, trend: 'down' }
          },
          topPosts: [
            {
              id: '3',
              content: 'Join us for our upcoming webinar on digital marketing strategies.',
              publishedAt: new Date('2024-01-14T16:00:00'),
              engagement: { likes: 156, comments: 32, shares: 28, views: 2100 }
            }
          ],
          audienceInsights: {
            ageGroups: [
              { range: '25-34', percentage: 35 },
              { range: '35-44', percentage: 28 },
              { range: '45-54', percentage: 20 },
              { range: '18-24', percentage: 12 },
              { range: '55+', percentage: 5 }
            ],
            gender: [
              { type: 'Male', percentage: 52 },
              { type: 'Female', percentage: 46 },
              { type: 'Other', percentage: 2 }
            ],
            locations: [
              { country: 'United States', percentage: 55 },
              { country: 'Canada', percentage: 15 },
              { country: 'United Kingdom', percentage: 10 },
              { country: 'Germany', percentage: 8 },
              { country: 'Other', percentage: 12 }
            ],
            activeHours: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              engagement: Math.floor(Math.random() * 100) + 15
            }))
          }
        },
        twitter: {
          platform: 'twitter',
          metrics: {
            followers: { current: 15600, change: 8.7, trend: 'up' },
            engagement: { current: 3200, change: 22.1, trend: 'up' },
            reach: { current: 35000, change: 18.9, trend: 'up' },
            impressions: { current: 78000, change: 25.4, trend: 'up' },
            posts: { current: 45, change: 28.6, trend: 'up' },
            engagementRate: { current: 2.1, change: 0.3, trend: 'up' }
          },
          topPosts: [
            {
              id: '4',
              content: 'Quick tip: Always engage with your audience authentically! 💡 #socialmedia',
              publishedAt: new Date('2024-01-13T11:45:00'),
              engagement: { likes: 89, comments: 24, shares: 34, views: 2400 }
            }
          ],
          audienceInsights: {
            ageGroups: [
              { range: '25-34', percentage: 38 },
              { range: '18-24', percentage: 25 },
              { range: '35-44', percentage: 22 },
              { range: '45-54', percentage: 10 },
              { range: '55+', percentage: 5 }
            ],
            gender: [
              { type: 'Male', percentage: 48 },
              { type: 'Female', percentage: 50 },
              { type: 'Other', percentage: 2 }
            ],
            locations: [
              { country: 'United States', percentage: 40 },
              { country: 'United Kingdom', percentage: 20 },
              { country: 'Canada', percentage: 15 },
              { country: 'India', percentage: 12 },
              { country: 'Other', percentage: 13 }
            ],
            activeHours: Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              engagement: Math.floor(Math.random() * 100) + 25
            }))
          }
        }
      };

      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAggregatedMetrics = () => {
    if (selectedPlatform === 'all') {
      const allData = Object.values(analyticsData);
      if (allData.length === 0) {
        return {
          followers: { current: 0, change: 0, trend: 'stable' as const },
          engagement: { current: 0, change: 0, trend: 'stable' as const },
          reach: { current: 0, change: 0, trend: 'stable' as const },
          impressions: { current: 0, change: 0, trend: 'stable' as const },
          posts: { current: 0, change: 0, trend: 'stable' as const },
          engagementRate: { current: 0, change: 0, trend: 'stable' as const }
        };
      }
      
      const avgChange = (metric: string) => 
        allData.reduce((sum, data) => sum + (data.metrics as any)[metric].change, 0) / allData.length;
      
      const getTrend = (change: number): 'up' | 'down' | 'stable' => 
        change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
      
      const followersChange = avgChange('followers');
      const engagementChange = avgChange('engagement');
      const reachChange = avgChange('reach');
      const impressionsChange = avgChange('impressions');
      const postsChange = avgChange('posts');
      const engagementRateChange = avgChange('engagementRate');
      
      return {
        followers: { 
          current: allData.reduce((sum, data) => sum + data.metrics.followers.current, 0),
          change: followersChange,
          trend: getTrend(followersChange)
        },
        engagement: { 
          current: allData.reduce((sum, data) => sum + data.metrics.engagement.current, 0),
          change: engagementChange,
          trend: getTrend(engagementChange)
        },
        reach: { 
          current: allData.reduce((sum, data) => sum + data.metrics.reach.current, 0),
          change: reachChange,
          trend: getTrend(reachChange)
        },
        impressions: { 
          current: allData.reduce((sum, data) => sum + data.metrics.impressions.current, 0),
          change: impressionsChange,
          trend: getTrend(impressionsChange)
        },
        posts: { 
          current: allData.reduce((sum, data) => sum + data.metrics.posts.current, 0),
          change: postsChange,
          trend: getTrend(postsChange)
        },
        engagementRate: { 
          current: allData.reduce((sum, data) => sum + data.metrics.engagementRate.current, 0) / allData.length,
          change: engagementRateChange,
          trend: getTrend(engagementRateChange)
        }
      };
    }
    return analyticsData[selectedPlatform]?.metrics || {
      followers: { current: 0, change: 0, trend: 'stable' as const },
      engagement: { current: 0, change: 0, trend: 'stable' as const },
      reach: { current: 0, change: 0, trend: 'stable' as const },
      impressions: { current: 0, change: 0, trend: 'stable' as const },
      posts: { current: 0, change: 0, trend: 'stable' as const },
      engagementRate: { current: 0, change: 0, trend: 'stable' as const }
    };
  };

  const getTopPosts = () => {
    if (selectedPlatform === 'all') {
      return Object.values(analyticsData)
        .flatMap(data => data.topPosts)
        .sort((a, b) => (b.engagement.likes + b.engagement.comments + b.engagement.shares) - 
                       (a.engagement.likes + a.engagement.comments + a.engagement.shares))
        .slice(0, 5);
    }
    return analyticsData[selectedPlatform]?.topPosts || [];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.color || 'bg-gray-500';
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.icon || 'fa-share-alt';
  };

  const metrics = getAggregatedMetrics();

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
            <Link
              href="/dashboard/social-media"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
            >
              ← Back to Social Media
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Analytics</h1>
            <p className="text-gray-600 mt-1">Track and analyze your social media performance</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Followers</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.followers?.current || 0)}</p>
              {metrics.followers?.change && (
                <p className={`text-sm ${metrics.followers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.followers.trend === 'up' ? '+' : ''}{metrics.followers.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-users text-2xl text-blue-600"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.engagement?.current || 0)}</p>
              {metrics.engagement?.change && (
                <p className={`text-sm ${metrics.engagement.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.engagement.trend === 'up' ? '+' : ''}{metrics.engagement.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-heart text-2xl text-red-600"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Reach</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.reach?.current || 0)}</p>
              {metrics.reach?.change && (
                <p className={`text-sm ${metrics.reach.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.reach.trend === 'up' ? '+' : ''}{metrics.reach.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-chart-line text-2xl text-orange-600"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Impressions</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.impressions?.current || 0)}</p>
              {metrics.impressions?.change && (
                <p className={`text-sm ${metrics.impressions.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.impressions.trend === 'up' ? '+' : ''}{metrics.impressions.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-eye text-2xl text-indigo-600"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.posts?.current || 0}</p>
              {metrics.posts?.change && (
                <p className={`text-sm ${metrics.posts.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.posts.trend === 'up' ? '+' : ''}{metrics.posts.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-image text-2xl text-purple-600"></i>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{(metrics.engagementRate?.current || 0).toFixed(1)}%</p>
              {metrics.engagementRate?.change && (
                <p className={`text-sm ${metrics.engagementRate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.engagementRate.trend === 'up' ? '+' : ''}{metrics.engagementRate.change.toFixed(1)}%
                </p>
              )}
            </div>
            <i className="fas fa-percentage text-2xl text-green-600"></i>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Top Posts
            </button>
            <button
              onClick={() => setActiveTab('audience')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audience'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audience Insights
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Chart Placeholder */}
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <i className="fas fa-chart-area text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-500 mb-2">Performance Chart</h3>
                <p className="text-gray-400">Interactive charts showing engagement, reach, and growth trends over time</p>
              </div>

              {/* Platform Breakdown */}
              {selectedPlatform === 'all' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analyticsData).map(([platformId, data]) => {
                      const platform = platforms.find(p => p.id === platformId);
                      return (
                        <div key={platformId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-8 h-8 ${platform?.color} rounded-full flex items-center justify-center`}>
                              <i className={`${platform?.icon} text-white text-sm`}></i>
                            </div>
                            <span className="font-medium text-gray-900">{platform?.name}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Followers:</span>
                              <span className="font-medium">{formatNumber(data.metrics.followers.current)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Engagement Rate:</span>
                              <span className="font-medium">{data.metrics.engagementRate.current.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Posts:</span>
                              <span className="font-medium">{data.metrics.posts.current}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
              <div className="space-y-4">
                {getTopPosts().length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-image text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">No posts data available for the selected period.</p>
                  </div>
                ) : (
                  getTopPosts().map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        {post.mediaUrl && (
                          <img 
                            src={post.mediaUrl} 
                            alt="Post media" 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{post.content}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            Published: {post.publishedAt.toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span><i className="fas fa-heart mr-1 text-red-500"></i>{post.engagement.likes}</span>
                            <span><i className="fas fa-comment mr-1 text-blue-500"></i>{post.engagement.comments}</span>
                            <span><i className="fas fa-share mr-1 text-green-500"></i>{post.engagement.shares}</span>
                            <span><i className="fas fa-eye mr-1 text-purple-500"></i>{post.engagement.views}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {post.engagement.likes + post.engagement.comments + post.engagement.shares} total engagements
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'audience' && (
            <div className="space-y-8">
              {selectedPlatform !== 'all' && analyticsData[selectedPlatform] && (
                <>
                  {/* Age Groups */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
                    <div className="space-y-3">
                      {analyticsData[selectedPlatform].audienceInsights.ageGroups.map((group) => (
                        <div key={group.range} className="flex items-center">
                          <div className="w-20 text-sm text-gray-600">{group.range}</div>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${group.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-12 text-sm text-gray-900 font-medium">{group.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
                    <div className="space-y-3">
                      {analyticsData[selectedPlatform].audienceInsights.gender.map((gender) => (
                        <div key={gender.type} className="flex items-center">
                          <div className="w-20 text-sm text-gray-600">{gender.type}</div>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-pink-600 h-2 rounded-full" 
                                style={{ width: `${gender.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-12 text-sm text-gray-900 font-medium">{gender.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
                    <div className="space-y-3">
                      {analyticsData[selectedPlatform].audienceInsights.locations.map((location) => (
                        <div key={location.country} className="flex items-center">
                          <div className="w-32 text-sm text-gray-600">{location.country}</div>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${location.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-12 text-sm text-gray-900 font-medium">{location.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Hours */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Hours</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-1">
                        {analyticsData[selectedPlatform].audienceInsights.activeHours.map((hour) => (
                          <div 
                            key={hour.hour} 
                            className="text-center"
                            title={`${hour.hour}:00 - ${hour.engagement}% active`}
                          >
                            <div 
                              className="bg-blue-600 rounded mb-1" 
                              style={{ height: `${Math.max(hour.engagement / 2, 8)}px` }}
                            ></div>
                            <span className="text-xs text-gray-600">{hour.hour}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedPlatform === 'all' && (
                <div className="text-center py-8">
                  <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">Select a specific platform to view audience insights.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 