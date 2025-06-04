'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  duration?: number;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
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
  deal?: {
    id: string;
    name: string;
    value: number;
  };
}

interface ActivityFilters {
  search: string;
  type: string;
  status: string;
  dateRange: string;
  assignedTo: string;
}

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Call', icon: PhoneIcon, color: 'bg-blue-100 text-blue-800' },
  { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon, color: 'bg-green-100 text-green-800' },
  { value: 'MEETING', label: 'Meeting', icon: UserGroupIcon, color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', icon: CheckCircleIcon, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NOTE', label: 'Note', icon: DocumentTextIcon, color: 'bg-gray-100 text-gray-800' },
  { value: 'SMS', label: 'SMS', icon: PhoneIcon, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn', icon: EnvelopeIcon, color: 'bg-blue-100 text-blue-800' },
  { value: 'DEMO', label: 'Demo', icon: UserGroupIcon, color: 'bg-orange-100 text-orange-800' },
  { value: 'FOLLOW_UP', label: 'Follow Up', icon: ClockIcon, color: 'bg-pink-100 text-pink-800' },
];

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    search: '',
    type: '',
    status: '',
    dateRange: '',
    assignedTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  useEffect(() => {
    loadActivities();
  }, [filters]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/activities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        toast.error('Failed to load activities');
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/complete`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast.success('Activity marked as completed');
        loadActivities();
      } else {
        toast.error('Failed to complete activity');
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      toast.error('Failed to complete activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Activity deleted successfully');
        loadActivities();
      } else {
        toast.error('Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedActivities.length === 0) {
      toast.error('Please select activities first');
      return;
    }

    try {
      const response = await fetch('/api/activities/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityIds: selectedActivities,
          action,
        }),
      });

      if (response.ok) {
        toast.success(`Activities ${action}d successfully`);
        setSelectedActivities([]);
        loadActivities();
      } else {
        toast.error(`Failed to ${action} activities`);
      }
    } catch (error) {
      console.error(`Error ${action}ing activities:`, error);
      toast.error(`Failed to ${action} activities`);
    }
  };

  const getActivityTypeInfo = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0];
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const filteredActivities = activities.filter(activity => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        activity.contact?.firstName.toLowerCase().includes(searchLower) ||
        activity.contact?.lastName?.toLowerCase().includes(searchLower) ||
        activity.company?.name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filters.type && activity.type !== filters.type) return false;
    if (filters.status === 'completed' && !activity.isCompleted) return false;
    if (filters.status === 'pending' && activity.isCompleted) return false;
    if (filters.assignedTo && activity.user.id !== filters.assignedTo) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-7 w-7 text-blue-600 mr-3" />
              Activities
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage all your customer interactions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            <Link
              href="/dashboard/activities/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Activity
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {ACTIVITY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  type: '',
                  status: '',
                  dateRange: '',
                  assignedTo: '',
                })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedActivities.length} activities selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('complete')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedActivities([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.type || filters.status 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first activity.'
              }
            </p>
            <Link
              href="/dashboard/activities/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Activity
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedActivities.length === filteredActivities.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivities(filteredActivities.map(a => a.id));
                        } else {
                          setSelectedActivities([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => {
                  const typeInfo = getActivityTypeInfo(activity.type);
                  const IconComponent = typeInfo.icon;
                  
                  return (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActivities([...selectedActivities, activity.id]);
                            } else {
                              setSelectedActivities(selectedActivities.filter(id => id !== activity.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </div>
                          {activity.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {activity.description}
                            </div>
                          )}
                          {activity.duration && (
                            <div className="text-xs text-gray-400">
                              Duration: {formatDuration(activity.duration)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activity.contact && (
                            <div>
                              <Link
                                href={`/dashboard/contacts/${activity.contact.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {activity.contact.firstName} {activity.contact.lastName}
                              </Link>
                            </div>
                          )}
                          {activity.company && (
                            <div>
                              <Link
                                href={`/dashboard/companies/${activity.company.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {activity.company.name}
                              </Link>
                            </div>
                          )}
                          {activity.deal && (
                            <div>
                              <Link
                                href={`/dashboard/deals/${activity.deal.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {activity.deal.name}
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activity.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activity.scheduledAt 
                            ? new Date(activity.scheduledAt).toLocaleDateString()
                            : new Date(activity.createdAt).toLocaleDateString()
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.scheduledAt 
                            ? new Date(activity.scheduledAt).toLocaleTimeString()
                            : new Date(activity.createdAt).toLocaleTimeString()
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {activity.isCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/activities/${activity.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/activities/${activity.id}/edit`}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          {!activity.isCompleted && (
                            <button
                              onClick={() => handleCompleteActivity(activity.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Mark as completed"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 