'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  TagIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  closeDate?: string;
  description?: string;
  source?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
  };
  company?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  activities: Activity[];
  tasks: Task[];
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  duration?: number;
  scheduledAt?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

const STAGE_COLORS: { [key: string]: string } = {
  PROSPECTING: 'bg-gray-100 text-gray-800',
  QUALIFICATION: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-yellow-100 text-yellow-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
};

const PRIORITY_COLORS: { [key: string]: string } = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: { [key: string]: string } = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function DealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);

  const dealId = params.id as string;

  useEffect(() => {
    if (dealId) {
      loadDealDetails();
    }
  }, [dealId, session]);

  const loadDealDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deals/${dealId}`);
      
      if (response.ok) {
        const dealData = await response.json();
        // Convert value from cents to dollars for display
        setDeal({
          ...dealData,
          value: dealData.value / 100,
        });
      } else if (response.status === 404) {
        toast.error('Deal not found');
        router.push('/dashboard/deals');
      } else {
        toast.error('Failed to load deal details');
      }
    } catch (error) {
      console.error('Error loading deal details:', error);
      toast.error('Failed to load deal details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deal || !confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Deal deleted successfully');
        router.push('/dashboard/deals');
      } else {
        toast.error('Failed to delete deal');
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilClose = (closeDate?: string) => {
    if (!closeDate) return null;
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Deal not found</p>
        <Link
          href="/dashboard/deals"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Deals
        </Link>
      </div>
    );
  }

  const daysUntilClose = getDaysUntilClose(deal.closeDate);
  const isOverdue = daysUntilClose !== null && daysUntilClose < 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/deals"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Deals
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deal.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800'
                }`}>
                  {deal.stage.replace('_', ' ')}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(deal.value)}
                </span>
                <span className="text-sm text-gray-500">
                  {deal.probability}% probability
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/deals/${deal.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'activities', name: `Activities (${deal.activities.length})` },
            { id: 'tasks', name: `Tasks (${deal.tasks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Name
                  </label>
                  <p className="text-sm text-gray-900">{deal.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <p className="text-sm text-gray-900 font-semibold">{formatCurrency(deal.value)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STAGE_COLORS[deal.stage] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {deal.stage.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-900">{deal.probability}%</span>
                  </div>
                </div>
                
                {deal.closeDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Close Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {formatDate(deal.closeDate)}
                      </span>
                      {daysUntilClose !== null && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : daysUntilClose <= 7 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isOverdue 
                            ? `${Math.abs(daysUntilClose)} days overdue`
                            : `${daysUntilClose} days left`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {deal.source && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <p className="text-sm text-gray-900">{deal.source}</p>
                  </div>
                )}
              </div>
              
              {deal.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.description}</p>
                </div>
              )}
              
              {deal.tags && deal.tags.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {deal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Company */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Information</h3>
              
              {deal.contact && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Contact
                  </label>
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {deal.contact.firstName} {deal.contact.lastName}
                      </p>
                      {deal.contact.email && (
                        <p className="text-sm text-gray-500">{deal.contact.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {deal.company && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.company.name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {deal.owner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Owner
                  </label>
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.owner.name}</p>
                      <p className="text-sm text-gray-500">{deal.owner.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">{formatDateTime(deal.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">{formatDateTime(deal.updatedAt)}</p>
                  </div>
                </div>
                
                {deal.lastActivity && (
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Activity</p>
                      <p className="text-sm text-gray-500">{formatDateTime(deal.lastActivity)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
              <Link
                href={`/dashboard/activities/new?dealId=${deal.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Activity
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {deal.activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No activities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deal.activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {activity.type}
                          </span>
                          {activity.isCompleted && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>By {activity.user.name}</span>
                          <span>{formatDateTime(activity.createdAt)}</span>
                          {activity.duration && (
                            <span>{activity.duration} minutes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <Link
                href={`/dashboard/tasks/new?dealId=${deal.id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Task
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {deal.tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deal.tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {task.assignee && (
                            <span>Assigned to {task.assignee.name}</span>
                          )}
                          {task.dueDate && (
                            <span>Due {formatDate(task.dueDate)}</span>
                          )}
                          <span>Created {formatDate(task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 