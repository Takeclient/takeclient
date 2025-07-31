'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  CheckIcon,
  TagIcon,
  UserGroupIcon,
  FlagIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  InformationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  FaceSmileIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  tags?: string[];
  contact?: {
    firstName: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
}

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  type: string;
  content?: string;
  mediaUrl?: string;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Integration {
  id: string;
  name: string;
  phoneNumber: string;
  isActive: boolean;
}

interface ConversationsListProps {
  integrationId: string | null;
  onNewConversation: () => void;
  integrations?: Integration[];
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export function ConversationsList({ integrationId, onNewConversation, integrations = [] }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(['leads', 'support', 'sales', 'urgent', 'vip']);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Smith', role: 'Sales Manager', avatar: '/avatars/1.jpg' },
    { id: '2', name: 'Sarah Johnson', role: 'Support Agent', avatar: '/avatars/2.jpg' },
    { id: '3', name: 'Mike Wilson', role: 'Sales Rep', avatar: '/avatars/3.jpg' }
  ]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeIntegration = integrations.find(i => i.id === integrationId);

  useEffect(() => {
    if (integrationId) {
      fetchConversations();
    }
  }, [integrationId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!integrationId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/whatsapp/conversations?integrationId=${integrationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/whatsapp/conversations/${conversationId}/read`, {
        method: 'POST',
      });
      // Update local conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      const response = await fetch('/api/whatsapp/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
          type: 'TEXT'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
        toast.success('Message sent');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const assignConversation = async (conversationId: string, userId: string) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchConversations();
        toast.success('Conversation assigned successfully');
      } else {
        toast.error('Failed to assign conversation');
      }
    } catch (error) {
      console.error('Error assigning conversation:', error);
      toast.error('Failed to assign conversation');
    }
  };

  const addTagToConversation = async (conversationId: string, tag: string) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });

      if (response.ok) {
        fetchConversations();
        toast.success('Tag added successfully');
      } else {
        toast.error('Failed to add tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const removeTagFromConversation = async (conversationId: string, tag: string) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });

      if (response.ok) {
        fetchConversations();
        toast.success('Tag removed successfully');
      } else {
        toast.error('Failed to remove tag');
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      toast.error('Failed to remove tag');
    }
  };

  const updateConversationPriority = async (conversationId: string, priority: string) => {
    try {
      const response = await fetch(`/api/whatsapp/conversations/${conversationId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });

      if (response.ok) {
        fetchConversations();
        toast.success('Priority updated successfully');
      } else {
        toast.error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerPhone.includes(searchQuery) ||
      conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || conv.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getMessageStatusIcon = (message: Message) => {
    if (message.direction === 'INBOUND') return null;
    
    if (message.readAt) {
      return <CheckIcon className="h-4 w-4 text-blue-500" />;
    } else if (message.deliveredAt) {
      return (
        <div className="flex">
          <CheckIcon className="h-4 w-4 text-gray-400" />
          <CheckIcon className="h-4 w-4 text-gray-400 -ml-2" />
        </div>
      );
    } else if (message.status === 'SENT') {
      return <CheckIcon className="h-4 w-4 text-gray-400" />;
    }
    return null;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const commonEmojis = ['👍', '❤️', '😊', '😢', '😂', '🙏', '👏', '🔥', '💯', '✅'];

  if (!integrationId || !activeIntegration) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fab fa-whatsapp text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No WhatsApp integration selected</p>
          <p className="text-sm text-gray-400 mt-2">
            Please select an active integration to view conversations
          </p>
        </div>
      </div>
    );
  }

  if (!activeIntegration.isActive) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fab fa-whatsapp text-6xl text-red-300 mb-4"></i>
          <p className="text-red-500 font-medium">Integration Not Connected</p>
          <p className="text-sm text-gray-500 mt-2">
            This WhatsApp integration is not active. Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] -m-6 bg-gray-50">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'w-1/3' : 'w-full'} border-r border-gray-200 bg-white flex flex-col`}>
        {/* Header with filters */}
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-green-600 mr-2" />
              Conversations
            </h3>
            <span className="text-sm text-gray-500">
              {activeIntegration.name}
            </span>
          </div>
          
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'New conversations will appear here'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    {conversation.contact?.avatar ? (
                      <img 
                        src={conversation.contact.avatar} 
                        alt="" 
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.customerName || conversation.contact?.firstName || 'Unknown'}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {conversation.priority && conversation.priority !== 'normal' && (
                          <FlagIcon className={`h-4 w-4 ${getPriorityColor(conversation.priority).split(' ')[0]}`} />
                        )}
                        {conversation.lastMessageAt && (
                          <p className="text-xs text-gray-500">
                            {format(new Date(conversation.lastMessageAt), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">{conversation.customerPhone}</p>
                    
                    {/* Tags */}
                    {conversation.tags && conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {conversation.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{conversation.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Assigned to */}
                    {conversation.assignedTo && (
                      <div className="flex items-center mt-1">
                        <UserGroupIcon className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {teamMembers.find(m => m.id === conversation.assignedTo)?.name || 'Assigned'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages View */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedConversation.contact?.avatar ? (
                  <img 
                    src={selectedConversation.contact.avatar} 
                    alt="" 
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedConversation.customerName || selectedConversation.contact?.firstName || 'Unknown'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{selectedConversation.customerPhone}</p>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowConversationInfo(!showConversationInfo)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Conversation Info"
                >
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Voice Call"
                >
                  <PhoneIcon className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs ${
                      message.direction === 'OUTBOUND' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {message.direction === 'INBOUND' && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {selectedConversation.customerName?.[0] || 'U'}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.direction === 'OUTBOUND'
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-900 shadow-sm border'
                        }`}
                      >
                        {message.type === 'TEXT' && <p className="text-sm">{message.content}</p>}
                        {message.type === 'IMAGE' && (
                          <div className="flex items-center space-x-2">
                            <PhotoIcon className="h-5 w-5" />
                            <p className="text-sm">Image</p>
                          </div>
                        )}
                        {message.type === 'DOCUMENT' && (
                          <div className="flex items-center space-x-2">
                            <DocumentIcon className="h-5 w-5" />
                            <p className="text-sm">Document</p>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-1 flex items-center justify-between ${
                          message.direction === 'OUTBOUND' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                          {getMessageStatusIcon(message)}
                        </div>
                        
                        {message.direction === 'OUTBOUND' && message.user && (
                          <div className="text-xs text-green-100 mt-1">
                            {message.user.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Attach file"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                        <div className="grid grid-cols-5 gap-2">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setNewMessage(prev => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="w-8 h-8 text-lg hover:bg-gray-100 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Info Panel */}
            {showConversationInfo && (
              <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Name</label>
                        <p className="text-sm text-gray-900">
                          {selectedConversation.customerName || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{selectedConversation.customerPhone}</p>
                      </div>
                      {selectedConversation.contact?.email && (
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="text-sm text-gray-900">{selectedConversation.contact.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignment */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Assignment</h4>
                    <select
                      value={selectedConversation.assignedTo || ''}
                      onChange={(e) => assignConversation(selectedConversation.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Priority</h4>
                    <select
                      value={selectedConversation.priority || 'normal'}
                      onChange={(e) => updateConversationPriority(selectedConversation.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
                    <div className="space-y-2">
                      {selectedConversation.tags && selectedConversation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedConversation.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                              <button
                                onClick={() => removeTagFromConversation(selectedConversation.id, tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addTagToConversation(selectedConversation.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Add a tag...</option>
                        {availableTags
                          .filter(tag => !selectedConversation.tags?.includes(tag))
                          .map((tag) => (
                            <option key={tag} value={tag}>
                              {tag}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border">
                        Create Contact
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border">
                        Create Lead
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border">
                        Schedule Follow-up
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200">
                        Block Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 