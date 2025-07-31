'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface WorkflowExecution {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  entityType: string;
  entityId: string;
  triggerType: string;
  triggerData: any;
  startedAt: string;
  completedAt?: string;
  error?: string;
  workflow: {
    id: string;
    name: string;
    description?: string;
  };
  logs: Array<{
    id: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    actionName: string;
    actionType: string;
    startedAt: string;
    completedAt?: string;
    result?: any;
    error?: string;
  }>;
}

export default function WorkflowExecutionsPage() {
  const { data: session } = useSession();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/workflows/executions');
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchExecutions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExecutions();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'RUNNING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatTriggerType = (triggerType: string) => {
    return triggerType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = end.getTime() - start.getTime();
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workflow Executions</h1>
              <p className="mt-2 text-gray-600">
                Monitor real-time workflow automation activity
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Executions</dt>
                    <dd className="text-lg font-medium text-gray-900">{executions.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Running</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {executions.filter(e => e.status === 'RUNNING').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {executions.filter(e => e.status === 'COMPLETED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {executions.filter(e => e.status === 'FAILED').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executions List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Executions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest workflow automation runs and their results
            </p>
          </div>
          
          {executions.length === 0 ? (
            <div className="text-center py-12">
              <PlayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No executions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Workflow executions will appear here when your automations run.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {executions.map((execution) => (
                <li key={execution.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(execution.status)}
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {execution.workflow.name}
                          </p>
                          <span className={`ml-2 ${getStatusBadge(execution.status)}`}>
                            {execution.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Triggered by: {formatTriggerType(execution.triggerType)}</span>
                          <span className="mx-2">•</span>
                          <span>Entity: {execution.entityType}</span>
                          <span className="mx-2">•</span>
                          <span>Duration: {formatDuration(execution.startedAt, execution.completedAt)}</span>
                        </div>
                        {execution.error && (
                          <p className="mt-1 text-sm text-red-600">
                            Error: {execution.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(execution.startedAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setSelectedExecution(execution)}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Execution Details Modal */}
        {selectedExecution && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Execution Details: {selectedExecution.workflow.name}
                  </h3>
                  <button
                    onClick={() => setSelectedExecution(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Execution Info</h4>
                    <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Status</dt>
                        <dd className={getStatusBadge(selectedExecution.status)}>
                          {selectedExecution.status}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Trigger</dt>
                        <dd className="text-gray-900">{formatTriggerType(selectedExecution.triggerType)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Started</dt>
                        <dd className="text-gray-900">{new Date(selectedExecution.startedAt).toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Duration</dt>
                        <dd className="text-gray-900">
                          {formatDuration(selectedExecution.startedAt, selectedExecution.completedAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {selectedExecution.logs && selectedExecution.logs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Action Logs</h4>
                      <div className="mt-2 space-y-2">
                        {selectedExecution.logs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getStatusIcon(log.status)}
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {log.actionName}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({log.actionType})
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDuration(log.startedAt, log.completedAt)}
                              </span>
                            </div>
                            {log.error && (
                              <p className="mt-2 text-sm text-red-600">{log.error}</p>
                            )}
                            {log.result && (
                              <div className="mt-2">
                                <details className="text-xs">
                                  <summary className="cursor-pointer text-gray-500">View Result</summary>
                                  <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(log.result, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExecution.triggerData && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Trigger Data</h4>
                      <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(selectedExecution.triggerData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 