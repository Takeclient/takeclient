'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PhotoIcon,
  DocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  lastMessageAt?: string;
  unreadCount: number;
  status: string;
  contact?: {
    firstName: string;
    lastName?: string;
    email?: string;
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
    name: string;
  };
}

interface ConversationsListProps {
  integrationId: string | null;
  onNewConversation: () => void;
}

export function ConversationsList({ integrationId, onNewConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

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

  const filteredConversations = conversations.filter(conv => 
    conv.customerPhone.includes(searchQuery) ||
    conv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (!integrationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fab fa-whatsapp text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No WhatsApp integration selected</p>
          <p className="text-sm text-gray-400 mt-2">
            Please add an integration first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] -m-6">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'w-1/3' : 'w-full'} border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <UserCircleIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.customerName || conversation.contact?.firstName || 'Unknown'}
                      </h4>
                      {conversation.lastMessageAt && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.customerPhone}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        {conversation.unreadCount} new
                      </span>
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
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center">
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedConversation.customerName || selectedConversation.contact?.firstName || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600">{selectedConversation.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.direction === 'OUTBOUND'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  {message.type === 'TEXT' && <p>{message.content}</p>}
                  {message.type === 'IMAGE' && (
                    <div>
                      <PhotoIcon className="h-6 w-6 mb-1" />
                      <p className="text-sm">Image</p>
                    </div>
                  )}
                  {message.type === 'DOCUMENT' && (
                    <div>
                      <DocumentIcon className="h-6 w-6 mb-1" />
                      <p className="text-sm">Document</p>
                    </div>
                  )}
                  <div className={`text-xs mt-1 flex items-center justify-between ${
                    message.direction === 'OUTBOUND' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                    {getMessageStatusIcon(message)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <PaperClipIcon className="h-6 w-6" />
              </button>
              <div className="flex-1">
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
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 