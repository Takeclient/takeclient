'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  hashTags: string[];
  platform: string | { id: string; name: string; displayName: string; icon: string; color: string };
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
}

const platforms: Platform[] = [
  { id: 'instagram', name: 'instagram', displayName: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E1306C' },
  { id: 'facebook', name: 'facebook', displayName: 'Facebook', icon: 'fa-brands fa-facebook', color: '#1877F2' },
  { id: 'twitter', name: 'twitter', displayName: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: '#000000' },
  { id: 'tiktok', name: 'tiktok', displayName: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#000000' },
  { id: 'snapchat', name: 'snapchat', displayName: 'Snapchat', icon: 'fa-brands fa-snapchat', color: '#FFFC00' },
];

export default function SocialMediaCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // New post form state
  const [newPost, setNewPost] = useState({
    content: '',
    mediaUrls: [] as string[],
    hashTags: [] as string[],
    platform: 'instagram',
    scheduledAt: '',
    publishNow: false
  });

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/social-media/posts?status=scheduled');
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
        } else {
          const error = await response.json();
          alert(`Failed to upload ${file.name}: ${error.error}`);
        }
      }

      setNewPost(prev => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (url: string) => {
    try {
      const filename = url.split('/').pop();
      await fetch(`/api/upload?filename=${filename}`, {
        method: 'DELETE',
      });

      setNewPost(prev => ({
        ...prev,
        mediaUrls: prev.mediaUrls.filter(mediaUrl => mediaUrl !== url)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleHashTagInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const tag = input.value.trim();
      
      if (tag && !newPost.hashTags.includes(tag)) {
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
        setNewPost(prev => ({
          ...prev,
          hashTags: [...prev.hashTags, formattedTag]
        }));
        input.value = '';
      }
    }
  };

  const removeHashTag = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      hashTags: prev.hashTags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const postData = {
        content: newPost.content,
        mediaUrls: newPost.mediaUrls,
        hashTags: newPost.hashTags,
        connectionId: 'mock_connection_' + newPost.platform, // This should be a real connection ID
        scheduledAt: newPost.publishNow ? null : newPost.scheduledAt,
        publishNow: newPost.publishNow
      };

      const response = await fetch('/api/social-media/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        
        // Reset form
        setNewPost({
          content: '',
          mediaUrls: [],
          hashTags: [],
          platform: 'instagram',
          scheduledAt: '',
          publishNow: false
        });
        
        setShowNewPostModal(false);
        fetchScheduledPosts(); // Refresh the posts
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return scheduledPosts.filter(post => 
      new Date(post.scheduledAt).toDateString() === dateStr
    );
  };

  const getPlatformColor = (platform: string | { name: string; color?: string }) => {
    const platformName = typeof platform === 'string' ? platform : platform.name;
    const platformObj = platforms.find(p => p.name === platformName);
    return platformObj?.color || '#6B7280';
  };

  const getPlatformIcon = (platform: string | { name: string; icon?: string }) => {
    const platformName = typeof platform === 'string' ? platform : platform.name;
    const platformObj = platforms.find(p => p.name === platformName);
    return platformObj?.icon || 'fa-share-alt';
  };

  const getPlatformDisplayName = (platform: string | { name: string; displayName?: string }) => {
    const platformName = typeof platform === 'string' ? platform : platform.name;
    const platformObj = platforms.find(p => p.name === platformName);
    return platformObj?.displayName || platformName;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Calendar</h1>
            <p className="text-gray-600 mt-1">Plan and schedule your social media posts</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewPostModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              New Post
            </button>
            <Link
              href="/dashboard/social-media"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-4">
            {days.map((day, index) => {
              const postsForDay = getPostsForDate(day);
              const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border rounded-lg p-2 cursor-pointer transition-colors ${
                    day 
                      ? isSelected 
                        ? 'border-blue-500 bg-blue-50'
                        : isToday
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'border-transparent'
                  }`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      {/* Posts indicators */}
                      <div className="space-y-1">
                        {postsForDay.slice(0, 3).map(post => (
                          <div
                            key={post.id}
                            className="text-xs px-2 py-1 rounded text-white truncate"
                            style={{ backgroundColor: getPlatformColor(post.platform) }}
                            title={post.content}
                          >
                            {post.content.substring(0, 20)}...
                          </div>
                        ))}
                        {postsForDay.length > 3 && (
                          <div className="text-xs text-gray-500 px-2">
                            +{postsForDay.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Posts for {selectedDate.toLocaleDateString()}
          </h3>
          
          {getPostsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">No posts scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {getPostsForDate(selectedDate).map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getPlatformColor(post.platform) }}
                    >
                      <i className={getPlatformIcon(post.platform)}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 capitalize">
                          {getPlatformDisplayName(post.platform)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.scheduledAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">{post.content}</p>
                      {post.hashTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashTags.map(tag => (
                            <span key={tag} className="text-blue-600 text-sm">{tag}</span>
                          ))}
                        </div>
                      )}
                      {post.mediaUrls.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {post.mediaUrls.map((url, index) => (
                            <img 
                              key={index}
                              src={url} 
                              alt={`Post media ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Create New Post</h3>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={newPost.platform}
                  onChange={(e) => setNewPost(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.name}>
                      {platform.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center ${
                      uploading ? 'opacity-50' : 'hover:bg-gray-50'
                    } transition-colors rounded-lg p-4`}
                  >
                    {uploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <span className="text-sm text-gray-600">Click to upload images</span>
                        <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Image Preview */}
                {newPost.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {newPost.mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hash Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                <input
                  type="text"
                  placeholder="Type hashtag and press Enter"
                  onKeyDown={handleHashTagInput}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newPost.hashTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newPost.hashTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeHashTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPost.publishNow}
                    onChange={(e) => setNewPost(prev => ({ ...prev, publishNow: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publish now</span>
                </label>
              </div>

              {!newPost.publishNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule for</label>
                  <input
                    type="datetime-local"
                    value={newPost.scheduledAt}
                    onChange={(e) => setNewPost(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : newPost.publishNow ? 'Publish Now' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 