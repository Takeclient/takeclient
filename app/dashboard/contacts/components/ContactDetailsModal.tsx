'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  TagIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  status: string;
  notes?: string;
  leadScore?: number;
  tags: string[];
  createdAt: string;
  lastActivity?: string;
  company?: {
    id: string;
    name: string;
    industry?: string;
    website?: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  stage?: {
    id: string;
    name: string;
    color: string;
    order: number;
  };
  deals: Array<{
    id: string;
    name: string;
    value: number;
    stage: string;
    createdAt: string;
  }>;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    createdAt: string;
    isCompleted: boolean;
    completedAt?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    isCompleted: boolean;
    priority: string;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface ContactStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface ContactDetailsModalProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated?: (contact: Contact) => void;
}

export default function ContactDetailsModal({
  contactId,
  isOpen,
  onClose,
  onContactUpdated,
}: ContactDetailsModalProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [stages, setStages] = useState<ContactStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'deals' | 'tasks'>('overview');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    status: '',
    notes: '',
    leadScore: 0,
    tags: [] as string[],
    stageId: '',
  });

  useEffect(() => {
    if (isOpen && contactId) {
      console.log('Modal opened for contact:', contactId);
      fetchContactDetails();
    }
  }, [isOpen, contactId]);

  const fetchContactDetails = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching contact details for:', contactId);
      const response = await fetch(`/api/contacts/${contactId}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Contact data received:', data);
        setContact(data.contact);
        setStages(data.stages);
        
        // Initialize edit form
        setEditForm({
          firstName: data.contact.firstName || '',
          lastName: data.contact.lastName || '',
          email: data.contact.email || '',
          phone: data.contact.phone || '',
          jobTitle: data.contact.jobTitle || '',
          status: data.contact.status || '',
          notes: data.contact.notes || '',
          leadScore: data.contact.leadScore || 0,
          tags: data.contact.tags || [],
          stageId: data.contact.stage?.id || '',
        });
      } else {
        toast.error('Failed to load contact details');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('Error loading contact details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        setIsEditing(false);
        toast.success('Contact updated successfully');
        
        // Notify parent component of the update
        if (onContactUpdated) {
          onContactUpdated(data.contact);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Error updating contact');
    }
  };

  const handleStageChange = async (newStageId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, stageId: newStageId }),
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        setEditForm(prev => ({ ...prev, stageId: newStageId }));
        
        const newStage = stages.find(s => s.id === newStageId);
        toast.success(`Contact moved to ${newStage?.name}`);
        
        // Refresh contact details to get updated activities
        fetchContactDetails();
        
        // Notify parent component of the update
        if (onContactUpdated) {
          onContactUpdated(data.contact);
        }
      } else {
        toast.error('Failed to update contact stage');
      }
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Error updating contact stage');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'LEAD': return 'bg-yellow-100 text-yellow-800';
      case 'QUALIFIED': return 'bg-blue-100 text-blue-800';
      case 'OPPORTUNITY': return 'bg-purple-100 text-purple-800';
      case 'CUSTOMER': return 'bg-green-100 text-green-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return PhoneIcon;
      case 'EMAIL': return EnvelopeIcon;
      case 'MEETING': return CalendarIcon;
      case 'NOTE': return DocumentTextIcon;
      default: return ClockIcon;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : contact ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {contact.firstName.charAt(0)}{contact.lastName?.charAt(0) || ''}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {contact.firstName} {contact.lastName || ''}
                    </h2>
                    <p className="text-gray-600">{contact.jobTitle}</p>
                    {contact.company && (
                      <p className="text-sm text-gray-500">{contact.company.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: UserIcon },
                    { id: 'activities', label: 'Activities', icon: ClockIcon },
                    { id: 'deals', label: 'Deals', icon: ChartBarIcon },
                    { id: 'tasks', label: 'Tasks', icon: CheckIcon },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.id === 'activities' && (
                        <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                          {contact.activities.length}
                        </span>
                      )}
                      {tab.id === 'deals' && (
                        <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                          {contact.deals.length}
                        </span>
                      )}
                      {tab.id === 'tasks' && (
                        <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                          {contact.tasks.length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Pipeline Stage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pipeline Stage
                      </label>
                      <select
                        value={editForm.stageId}
                        onChange={(e) => handleStageChange(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Stage</option>
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                      {contact.stage && (
                        <div className="mt-2 flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: contact.stage.color }}
                          />
                          <span className="text-sm text-gray-600">
                            Current: {contact.stage.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                        <div className="space-y-3">
                          {isEditing ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                  type="text"
                                  value={editForm.firstName}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                  type="text"
                                  value={editForm.lastName}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                  type="tel"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                <input
                                  type="text"
                                  value={editForm.jobTitle}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {contact.email && (
                                <div className="flex items-center">
                                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center">
                                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                              {contact.company && (
                                <div className="flex items-center">
                                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                  <span>{contact.company.name}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(contact.status)}`}>
                              {contact.status}
                            </span>
                          </div>
                          
                          {contact.leadScore !== undefined && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Lead Score:</span>
                              <span className="ml-2 text-sm text-gray-900">{contact.leadScore}/100</span>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-sm font-medium text-gray-700">Created:</span>
                            <span className="ml-2 text-sm text-gray-900">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {contact.lastActivity && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Last Activity:</span>
                              <span className="ml-2 text-sm text-gray-900">
                                {new Date(contact.lastActivity).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {contact.tags.length > 0 && (
                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-700">Tags:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {contact.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  <TagIcon className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {(contact.notes || isEditing) && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                        {isEditing ? (
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={4}
                            className="block w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Add notes about this contact..."
                          />
                        ) : (
                          <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                        )}
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    {contact.activities.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No activities found</p>
                    ) : (
                      contact.activities.map((activity) => {
                        const IconComponent = getActivityIcon(activity.type);
                        return (
                          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <IconComponent className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                by {activity.user.name}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'deals' && (
                  <div className="space-y-4">
                    {contact.deals.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No deals found</p>
                    ) : (
                      contact.deals.map((deal) => (
                        <div key={deal.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{deal.name}</h4>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                            <span>Stage: {deal.stage}</span>
                            <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    {contact.tasks.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No tasks found</p>
                    ) : (
                      contact.tasks.map((task) => (
                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={task.isCompleted}
                                readOnly
                                className="mt-1"
                              />
                              <div>
                                <h4 className={`text-sm font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                                {task.assignee && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Assigned to: {task.assignee.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {task.dueDate && (
                                <p className="text-xs text-gray-500">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-500">Contact not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 