'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
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

interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  overdue: boolean;
}

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: ArrowUpIcon },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: MinusIcon },
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: ArrowDownIcon },
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    dueDate: '',
    overdue: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast.error('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Task status updated');
        loadTasks();
      } else {
        toast.error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Task deleted successfully');
        loadTasks();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTasks.length === 0) {
      toast.error('Please select tasks first');
      return;
    }

    try {
      const response = await fetch('/api/tasks/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds: selectedTasks,
          action,
        }),
      });

      if (response.ok) {
        toast.success(`Tasks ${action}d successfully`);
        setSelectedTasks([]);
        loadTasks();
      } else {
        toast.error(`Failed to ${action} tasks`);
      }
    } catch (error) {
      console.error(`Error ${action}ing tasks:`, error);
      toast.error(`Failed to ${action} tasks`);
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
    return new Date(task.dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.contact?.firstName.toLowerCase().includes(searchLower) ||
        task.contact?.lastName?.toLowerCase().includes(searchLower) ||
        task.company?.name.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignedTo && task.assignee.id !== filters.assignedTo) return false;
    if (filters.overdue && !isOverdue(task)) return false;

    if (filters.dueDate) {
      const today = new Date();
      const taskDue = task.dueDate ? new Date(task.dueDate) : null;
      
      switch (filters.dueDate) {
        case 'today':
          if (!taskDue || taskDue.toDateString() !== today.toDateString()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (!taskDue || taskDue > weekFromNow) return false;
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (!taskDue || taskDue > monthFromNow) return false;
          break;
      }
    }

    return true;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'PENDING').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-7 w-7 text-green-600 mr-3" />
              Tasks
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your team's tasks and assignments
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.pending}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{taskStats.inProgress}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{taskStats.completed}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{taskStats.overdue}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <select
                value={filters.dueDate}
                onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Dates</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="month">Due This Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Overdue
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.overdue}
                  onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Overdue only</span>
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  priority: '',
                  assignedTo: '',
                  dueDate: '',
                  overdue: false,
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
      {selectedTasks.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">
              {selectedTasks.length} tasks selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('complete')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkAction('in_progress')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                In Progress
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.priority 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first task.'
              }
            </p>
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Task
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
                      checked={selectedTasks.length === filteredTasks.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredTasks.map(t => t.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const priorityConfig = PRIORITY_CONFIG[task.priority];
                  const statusConfig = STATUS_CONFIG[task.status];
                  const PriorityIcon = priorityConfig.icon;
                  const overdue = isOverdue(task);
                  
                  return (
                    <tr key={task.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                            {overdue && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {priorityConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-0.5 border-0 ${statusConfig.color}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{task.assignee.name}</div>
                            <div className="text-xs text-gray-500">{task.assignee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? (
                          <div>
                            <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {overdue 
                                ? `${Math.abs(getDaysUntilDue(task.dueDate))} days overdue`
                                : getDaysUntilDue(task.dueDate) === 0 
                                  ? 'Due today'
                                  : `${getDaysUntilDue(task.dueDate)} days left`
                              }
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No due date</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {task.contact && (
                            <div>
                              <Link
                                href={`/dashboard/contacts/${task.contact.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.contact.firstName} {task.contact.lastName}
                              </Link>
                            </div>
                          )}
                          {task.company && (
                            <div>
                              <Link
                                href={`/dashboard/companies/${task.company.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.company.name}
                              </Link>
                            </div>
                          )}
                          {task.deal && (
                            <div>
                              <Link
                                href={`/dashboard/deals/${task.deal.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.deal.name}
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/tasks/${task.id}/edit`}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
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