'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PlatformConnection {
  id: string;
  name: string;
  icon: string;
  color: string;
  isConnected: boolean;
  accountName?: string;
  accountHandle?: string;
  lastSync?: Date;
  permissions: string[];
  status: 'active' | 'error' | 'pending';
}

interface PostingSettings {
  defaultHashtags: string[];
  autoPosting: boolean;
  postTiming: 'immediate' | 'optimal' | 'scheduled';
  crossPosting: boolean;
  contentModeration: boolean;
  linkShortening: boolean;
  watermark: boolean;
}

interface NotificationSettings {
  mentions: boolean;
  directMessages: boolean;
  comments: boolean;
  postPublished: boolean;
  postFailed: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const platforms = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: 'fa-brands fa-instagram', 
    color: 'bg-pink-500',
    description: 'Connect your Instagram Business account'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: 'fa-brands fa-facebook', 
    color: 'bg-blue-600',
    description: 'Connect your Facebook Page'
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: 'fa-brands fa-x-twitter', 
    color: 'bg-black',
    description: 'Connect your X (Twitter) account'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: 'fa-brands fa-tiktok', 
    color: 'bg-black',
    description: 'Connect your TikTok Business account'
  },
  { 
    id: 'snapchat', 
    name: 'Snapchat', 
    icon: 'fa-brands fa-snapchat', 
    color: 'bg-yellow-400',
    description: 'Connect your Snapchat account'
  },
];

export default function SocialMediaSettingsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [postingSettings, setPostingSettings] = useState<PostingSettings>({
    defaultHashtags: [],
    autoPosting: false,
    postTiming: 'optimal',
    crossPosting: true,
    contentModeration: true,
    linkShortening: true,
    watermark: false
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    mentions: true,
    directMessages: true,
    comments: true,
    postPublished: true,
    postFailed: true,
    weeklyReport: true,
    monthlyReport: true,
    emailNotifications: true,
    pushNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connections' | 'posting' | 'notifications'>('connections');
  const [newHashtag, setNewHashtag] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockConnections: PlatformConnection[] = [
        {
          id: 'instagram',
          name: 'Instagram',
          icon: 'fa-brands fa-instagram',
          color: 'bg-pink-500',
          isConnected: true,
          accountName: 'YourBusiness',
          accountHandle: '@yourbusiness',
          lastSync: new Date('2024-01-15T14:30:00'),
          permissions: ['read_insights', 'publish_content', 'manage_comments'],
          status: 'active'
        },
        {
          id: 'facebook',
          name: 'Facebook',
          icon: 'fa-brands fa-facebook',
          color: 'bg-blue-600',
          isConnected: true,
          accountName: 'Your Business Page',
          accountHandle: 'YourBusinessPage',
          lastSync: new Date('2024-01-15T14:25:00'),
          permissions: ['manage_pages', 'publish_pages', 'read_insights'],
          status: 'active'
        },
        {
          id: 'twitter',
          name: 'X (Twitter)',
          icon: 'fa-brands fa-x-twitter',
          color: 'bg-black',
          isConnected: false,
          permissions: [],
          status: 'pending'
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          icon: 'fa-brands fa-tiktok',
          color: 'bg-black',
          isConnected: true,
          accountName: 'yourbusiness',
          accountHandle: '@yourbusiness',
          lastSync: new Date('2024-01-15T12:00:00'),
          permissions: ['user.info.basic', 'video.publish'],
          status: 'error'
        },
        {
          id: 'snapchat',
          name: 'Snapchat',
          icon: 'fa-brands fa-snapchat',
          color: 'bg-yellow-400',
          isConnected: false,
          permissions: [],
          status: 'pending'
        }
      ];

      setConnections(mockConnections);
      setPostingSettings({
        defaultHashtags: ['#business', '#marketing', '#growth'],
        autoPosting: true,
        postTiming: 'optimal',
        crossPosting: true,
        contentModeration: true,
        linkShortening: true,
        watermark: false
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    try {
      // Simulate OAuth flow
      setConnections(prev => prev.map(conn => 
        conn.id === platformId 
          ? { ...conn, status: 'pending' }
          : conn
      ));

      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setConnections(prev => prev.map(conn => 
        conn.id === platformId 
          ? { 
              ...conn, 
              isConnected: true,
              status: 'active',
              accountName: 'Your Account',
              accountHandle: '@youraccount',
              lastSync: new Date(),
              permissions: ['basic_read', 'publish_content']
            }
          : conn
      ));
    } catch (error) {
      console.error('Error connecting platform:', error);
      setConnections(prev => prev.map(conn => 
        conn.id === platformId 
          ? { ...conn, status: 'error' }
          : conn
      ));
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      setConnections(prev => prev.map(conn => 
        conn.id === platformId 
          ? { 
              ...conn, 
              isConnected: false,
              status: 'pending',
              accountName: undefined,
              accountHandle: undefined,
              lastSync: undefined,
              permissions: []
            }
          : conn
      ));
    } catch (error) {
      console.error('Error disconnecting platform:', error);
    }
  };

  const handleSync = async (platformId: string) => {
    try {
      setConnections(prev => prev.map(conn => 
        conn.id === platformId 
          ? { ...conn, lastSync: new Date(), status: 'active' }
          : conn
      ));
    } catch (error) {
      console.error('Error syncing platform:', error);
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !postingSettings.defaultHashtags.includes(newHashtag.trim())) {
      const hashtag = newHashtag.startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`;
      setPostingSettings(prev => ({
        ...prev,
        defaultHashtags: [...prev.defaultHashtags, hashtag]
      }));
      setNewHashtag('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setPostingSettings(prev => ({
      ...prev,
      defaultHashtags: prev.defaultHashtags.filter(tag => tag !== hashtag)
    }));
  };

  const updatePostingSetting = (key: keyof PostingSettings, value: any) => {
    setPostingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Simulate API call to save settings
      console.log('Saving settings:', { postingSettings, notificationSettings });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
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
            <Link
              href="/dashboard/social-media"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
            >
              ← Back to Social Media
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Settings</h1>
            <p className="text-gray-600 mt-1">Manage your social media platform connections and preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Platform Connections
            </button>
            <button
              onClick={() => setActiveTab('posting')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posting'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posting Preferences
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Platform Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Platforms</h3>
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${connection.color} rounded-full flex items-center justify-center`}>
                            <i className={`${connection.icon} text-white text-xl`}></i>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{connection.name}</h4>
                            {connection.isConnected ? (
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  Connected as: <span className="font-medium">{connection.accountName}</span>
                                  {connection.accountHandle && (
                                    <span className="text-gray-500"> ({connection.accountHandle})</span>
                                  )}
                                </p>
                                {connection.lastSync && (
                                  <p className="text-xs text-gray-500">
                                    Last synced: {connection.lastSync.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                {platforms.find(p => p.id === connection.id)?.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {connection.status === 'error' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              Connection Error
                            </span>
                          )}
                          {connection.status === 'pending' && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Connecting...
                            </span>
                          )}
                          {connection.status === 'active' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                          
                          {connection.isConnected ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSync(connection.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Sync
                              </button>
                              <button
                                onClick={() => handleDisconnect(connection.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Disconnect
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnect(connection.id)}
                              disabled={connection.status === 'pending'}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {connection.status === 'pending' ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {connection.isConnected && connection.permissions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {connection.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Posting Preferences Tab */}
          {activeTab === 'posting' && (
            <div className="space-y-8">
              {/* Default Hashtags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Hashtags</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                      placeholder="Add hashtag (e.g., marketing)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addHashtag}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {postingSettings.defaultHashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{hashtag}</span>
                        <button
                          onClick={() => removeHashtag(hashtag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Posting Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Posting Options</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Auto Posting</h4>
                      <p className="text-sm text-gray-500">Automatically publish scheduled posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postingSettings.autoPosting}
                        onChange={(e) => updatePostingSetting('autoPosting', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Post Timing</h4>
                    <select
                      value={postingSettings.postTiming}
                      onChange={(e) => updatePostingSetting('postTiming', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="optimal">Optimal Time</option>
                      <option value="scheduled">Scheduled Time</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Cross-posting</h4>
                      <p className="text-sm text-gray-500">Post to multiple platforms simultaneously</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postingSettings.crossPosting}
                        onChange={(e) => updatePostingSetting('crossPosting', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Content Moderation</h4>
                      <p className="text-sm text-gray-500">Review posts before publishing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postingSettings.contentModeration}
                        onChange={(e) => updatePostingSetting('contentModeration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Link Shortening</h4>
                      <p className="text-sm text-gray-500">Automatically shorten URLs in posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postingSettings.linkShortening}
                        onChange={(e) => updatePostingSetting('linkShortening', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Watermark</h4>
                      <p className="text-sm text-gray-500">Add brand watermark to images</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postingSettings.watermark}
                        onChange={(e) => updatePostingSetting('watermark', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  {/* Engagement Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Engagement</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Mentions</span>
                          <p className="text-sm text-gray-500">When someone mentions your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.mentions}
                            onChange={(e) => updateNotificationSetting('mentions', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Direct Messages</span>
                          <p className="text-sm text-gray-500">New direct messages received</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.directMessages}
                            onChange={(e) => updateNotificationSetting('directMessages', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Comments</span>
                          <p className="text-sm text-gray-500">New comments on your posts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.comments}
                            onChange={(e) => updateNotificationSetting('comments', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Publishing Notifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Publishing</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Post Published</span>
                          <p className="text-sm text-gray-500">When a scheduled post is published</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.postPublished}
                            onChange={(e) => updateNotificationSetting('postPublished', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Post Failed</span>
                          <p className="text-sm text-gray-500">When a post fails to publish</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.postFailed}
                            onChange={(e) => updateNotificationSetting('postFailed', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Reports */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Reports</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Weekly Report</span>
                          <p className="text-sm text-gray-500">Weekly performance summary</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.weeklyReport}
                            onChange={(e) => updateNotificationSetting('weeklyReport', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Monthly Report</span>
                          <p className="text-sm text-gray-500">Monthly performance summary</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.monthlyReport}
                            onChange={(e) => updateNotificationSetting('monthlyReport', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Methods */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Methods</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => updateNotificationSetting('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                          <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => updateNotificationSetting('pushNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {(activeTab === 'posting' || activeTab === 'notifications') && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={saveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 