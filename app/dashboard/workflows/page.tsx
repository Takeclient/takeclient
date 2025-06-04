'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BoltIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  triggerType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    actions: number;
    executions: number;
  };
  stats?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: string;
  };
}

const triggerTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  CONTACT_CREATED: { label: 'Contact Created', icon: '👤', color: 'blue' },
  CONTACT_UPDATED: { label: 'Contact Updated', icon: '✏️', color: 'yellow' },
  CONTACT_STAGE_CHANGED: { label: 'Contact Stage Changed', icon: '🔄', color: 'green' },
  DEAL_CREATED: { label: 'Deal Created', icon: '💰', color: 'purple' },
  DEAL_WON: { label: 'Deal Won', icon: '🎉', color: 'green' },
  DEAL_LOST: { label: 'Deal Lost', icon: '😔', color: 'red' },
  FORM_SUBMITTED: { label: 'Form Submitted', icon: '📝', color: 'indigo' },
  EMAIL_OPENED: { label: 'Email Opened', icon: '📧', color: 'blue' },
  WHATSAPP_MESSAGE_RECEIVED: { label: 'WhatsApp Message', icon: '💬', color: 'green' },
  TIME_BASED: { label: 'Time Based', icon: '⏰', color: 'orange' },
  RECURRING: { label: 'Recurring', icon: '🔁', color: 'purple' },
};

export default function WorkflowsPage() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkflowStatus = async (workflowId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/toggle`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(currentStatus ? 'Workflow paused' : 'Workflow activated');
        fetchWorkflows();
      } else {
        throw new Error('Failed to toggle workflow');
      }
    } catch (error) {
      toast.error('Failed to update workflow status');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && workflow.isActive && workflow.status === 'ACTIVE') ||
      (filter === 'paused' && (!workflow.isActive || workflow.status === 'PAUSED')) ||
      (filter === 'draft' && workflow.status === 'DRAFT');

    const matchesSearch = searchTerm === '' || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (workflow: Workflow) => {
    if (workflow.status === 'DRAFT') {
      return <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />;
    }
    if (!workflow.isActive || workflow.status === 'PAUSED') {
      return <PauseIcon className="h-5 w-5 text-yellow-500" />;
    }
    return <PlayIcon className="h-5 w-5 text-green-500" />;
  };

  const getStatusLabel = (workflow: Workflow) => {
    if (workflow.status === 'DRAFT') return 'Draft';
    if (!workflow.isActive || workflow.status === 'PAUSED') return 'Paused';
    return 'Active';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BoltIcon className="h-7 w-7 text-purple-600 mr-3" />
              Workflow Automation
            </h1>
            <p className="text-gray-600 mt-1">
              Automate your business processes and save time
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/workflows/templates"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Templates
            </Link>
            <Link
              href="/dashboard/workflows/new"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Workflow
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
            </div>
            <BoltIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.filter(w => w.isActive && w.status === 'ACTIVE').length}
              </p>
            </div>
            <PlayIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.reduce((sum, w) => sum + (w._count?.executions || 0), 0)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {workflows.length > 0 
                  ? `${Math.round(
                      workflows.reduce((sum, w) => sum + ((w.stats?.successfulRuns || 0) / (w.stats?.totalRuns || 1)), 0) / 
                      workflows.length * 100
                    )}%`
                  : '0%'
                }
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'active'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('paused')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'paused'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'draft'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Draft
            </button>
          </div>
          
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filter !== 'all' ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first automation workflow.'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/dashboard/workflows/new"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Workflow
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Workflow</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Trigger</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Executions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Run</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.map((workflow) => {
                  const triggerInfo = triggerTypeLabels[workflow.triggerType] || {
                    label: workflow.triggerType,
                    icon: '❓',
                    color: 'gray'
                  };
                  
                  return (
                    <tr key={workflow.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(workflow)}
                          <span className="ml-2 text-sm text-gray-700">
                            {getStatusLabel(workflow)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <Link
                            href={`/dashboard/workflows/${workflow.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-purple-600"
                          >
                            {workflow.name}
                          </Link>
                          {workflow.description && (
                            <p className="text-sm text-gray-500">{workflow.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{triggerInfo.icon}</span>
                          <span className="text-sm text-gray-700">{triggerInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{workflow._count.actions} actions</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-700">{workflow._count.executions}</span>
                            {workflow.stats && workflow.stats.failedRuns > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                {workflow.stats.failedRuns} failed
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {workflow.stats?.lastRun 
                            ? new Date(workflow.stats.lastRun).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {workflow.status !== 'DRAFT' && (
                            <button
                              onClick={() => toggleWorkflowStatus(workflow.id, workflow.isActive)}
                              className={`p-1 rounded-md ${
                                workflow.isActive
                                  ? 'text-yellow-600 hover:bg-yellow-100'
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={workflow.isActive ? 'Pause' : 'Activate'}
                            >
                              {workflow.isActive ? (
                                <PauseIcon className="h-5 w-5" />
                              ) : (
                                <PlayIcon className="h-5 w-5" />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/dashboard/workflows/${workflow.id}/edit`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/dashboard/workflows/${workflow.id}/executions`}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            History
                          </Link>
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