'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  platform: string;
  participant: {
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  lastMessage: {
    id: string;
    content: string;
    timestamp: Date;
    isFromUser: boolean;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    mediaUrl?: string;
  };
  unreadCount: number;
  isOnline?: boolean;
  labels?: string[];
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  isFromUser: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: 'bg-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', color: 'bg-blue-600' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: 'bg-black' },
  { id: 'snapchat', name: 'Snapchat', icon: 'fa-brands fa-snapchat', color: 'bg-yellow-400' },
];

export default function SocialMediaMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [selectedPlatform]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockConversations: Conversation[] = [
        {
          id: '1',
          platform: 'instagram',
          participant: {
            name: 'Sarah Johnson',
            username: '@sarah_j',
            avatar: 'https://via.placeholder.com/40x40',
            verified: true
          },
          lastMessage: {
            id: 'm1',
            content: 'Love your latest post! When will the new collection be available?',
            timestamp: new Date('2024-01-15T14:30:00'),
            isFromUser: false,
            type: 'text'
          },
          unreadCount: 2,
          isOnline: true,
          labels: ['Customer', 'VIP']
        },
        {
          id: '2',
          platform: 'facebook',
          participant: {
            name: 'Mike Chen',
            username: 'mike.chen',
            avatar: 'https://via.placeholder.com/40x40'
          },
          lastMessage: {
            id: 'm2',
            content: 'Thank you for the quick response! That solved my issue.',
            timestamp: new Date('2024-01-15T12:15:00'),
            isFromUser: false,
            type: 'text'
          },
          unreadCount: 0,
          isOnline: false,
          labels: ['Support', 'Resolved']
        },
        {
          id: '3',
          platform: 'twitter',
          participant: {
            name: 'Alex Rodriguez',
            username: '@alex_r',
            verified: false
          },
          lastMessage: {
            id: 'm3',
            content: 'Can I get more details about your pricing plans?',
            timestamp: new Date('2024-01-15T11:45:00'),
            isFromUser: false,
            type: 'text'
          },
          unreadCount: 1,
          isOnline: true,
          labels: ['Lead', 'Prospect']
        },
        {
          id: '4',
          platform: 'tiktok',
          participant: {
            name: 'Emma Davis',
            username: '@emma_d',
            avatar: 'https://via.placeholder.com/40x40'
          },
          lastMessage: {
            id: 'm4',
            content: 'Your tutorials are amazing! Do you offer private lessons?',
            timestamp: new Date('2024-01-15T10:20:00'),
            isFromUser: false,
            type: 'text'
          },
          unreadCount: 3,
          isOnline: false,
          labels: ['Student', 'Interest']
        },
        {
          id: '5',
          platform: 'instagram',
          participant: {
            name: 'Brand Collaborations',
            username: '@brand_collab',
            verified: true
          },
          lastMessage: {
            id: 'm5',
            content: 'We have a collaboration proposal for you. Are you interested?',
            timestamp: new Date('2024-01-14T16:00:00'),
            isFromUser: false,
            type: 'text'
          },
          unreadCount: 0,
          isOnline: false,
          labels: ['Business', 'Collaboration']
        }
      ];

      // Filter by platform if selected
      const filteredConversations = selectedPlatform === 'all' 
        ? mockConversations 
        : mockConversations.filter(c => c.platform === selectedPlatform);

      setConversations(filteredConversations);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && filteredConversations.length > 0) {
        setSelectedConversation(filteredConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // Mock messages for the selected conversation
      const mockMessages: Message[] = [
        {
          id: 'm1',
          conversationId,
          content: 'Hi! I saw your latest product announcement.',
          timestamp: new Date('2024-01-15T14:00:00'),
          isFromUser: false,
          type: 'text',
          status: 'read'
        },
        {
          id: 'm2',
          conversationId,
          content: 'Thank you for reaching out! Which product are you interested in?',
          timestamp: new Date('2024-01-15T14:05:00'),
          isFromUser: true,
          type: 'text',
          status: 'read'
        },
        {
          id: 'm3',
          conversationId,
          content: 'The new smartwatch collection looks amazing!',
          timestamp: new Date('2024-01-15T14:10:00'),
          isFromUser: false,
          type: 'text',
          status: 'read'
        },
        {
          id: 'm4',
          conversationId,
          content: 'Great choice! Here are the specs and pricing details.',
          timestamp: new Date('2024-01-15T14:15:00'),
          isFromUser: true,
          type: 'text',
          status: 'read'
        },
        {
          id: 'm5',
          conversationId,
          content: 'Love your latest post! When will the new collection be available?',
          timestamp: new Date('2024-01-15T14:30:00'),
          isFromUser: false,
          type: 'text',
          status: 'delivered'
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        conversationId: selectedConversation,
        content: newMessage,
        timestamp: new Date(),
        isFromUser: true,
        type: 'text',
        status: 'sent'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: {
                ...message,
                isFromUser: true
              }
            }
          : conv
      ));

      // Simulate message status updates
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);

      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        ));
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.color || 'bg-gray-500';
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.icon || 'fa-share-alt';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

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
            <h1 className="text-2xl font-bold text-gray-900">Social Media Messages</h1>
            <p className="text-gray-600 mt-1">Manage conversations across all your social media platforms</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalUnread} unread
            </div>
          </div>
        </div>
      </div>

      {/* Platform Filter */}
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

      {/* Messages Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-comments text-3xl mb-2"></i>
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id);
                      markAsRead(conversation.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 ${getPlatformColor(conversation.platform)} rounded-full flex items-center justify-center`}
                        >
                          <i className={`${getPlatformIcon(conversation.platform)} text-white`}></i>
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.participant.name}
                            </p>
                            {conversation.participant.verified && (
                              <i className="fas fa-check-circle text-blue-500 text-xs"></i>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{conversation.participant.username}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.isFromUser ? 'You: ' : ''}
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.labels && conversation.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {conversation.labels.map((label, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${getPlatformColor(selectedConv.platform)} rounded-full flex items-center justify-center`}
                      >
                        <i className={`${getPlatformIcon(selectedConv.platform)} text-white`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{selectedConv.participant.name}</h3>
                          {selectedConv.participant.verified && (
                            <i className="fas fa-check-circle text-blue-500 text-sm"></i>
                          )}
                          {selectedConv.isOnline && (
                            <span className="flex items-center text-xs text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{selectedConv.participant.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-phone"></i>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-video"></i>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isFromUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.isFromUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.isFromUser && (
                            <span className="ml-2">
                              {message.status === 'sent' && <i className="fas fa-check"></i>}
                              {message.status === 'delivered' && <i className="fas fa-check-double"></i>}
                              {message.status === 'read' && <i className="fas fa-check-double text-blue-300"></i>}
                              {message.status === 'failed' && <i className="fas fa-exclamation-triangle text-red-300"></i>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-paperclip"></i>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-image"></i>
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 