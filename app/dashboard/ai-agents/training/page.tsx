'use client';

import { useState } from 'react';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

interface TrainingSession {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  accuracy: number;
  dataPoints: number;
  startedAt: string;
  completedAt?: string;
}

export default function AgentTraining() {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [trainingData, setTrainingData] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  const agents = [
    { id: '1', name: 'Sales Assistant Sarah', status: 'active' },
    { id: '2', name: 'Customer Support Bot', status: 'active' },
    { id: '3', name: 'Lead Qualifier Max', status: 'training' },
  ];

  const trainingSessions: TrainingSession[] = [
    {
      id: '1',
      agentId: '1',
      agentName: 'Sales Assistant Sarah',
      status: 'completed',
      progress: 100,
      accuracy: 94.2,
      dataPoints: 1250,
      startedAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T09:15:00Z',
    },
    {
      id: '2',
      agentId: '3',
      agentName: 'Lead Qualifier Max',
      status: 'running',
      progress: 67,
      accuracy: 0,
      dataPoints: 450,
      startedAt: '2024-01-15T10:30:00Z',
    },
  ];

  const handleStartTraining = async () => {
    if (!selectedAgent || !trainingData) return;
    
    setIsTraining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Reset form
      setSelectedAgent('');
      setTrainingData('');
    } catch (error) {
      console.error('Error starting training:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const getStatusBadge = (status: TrainingSession['status']) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TrainingSession['status']) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <PlayIcon className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Agent Training</h1>
        <p className="mt-1 text-sm text-gray-500">
          Improve your agents' performance with custom training data
        </p>
      </div>

      {/* Training Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <AcademicCapIcon className="h-5 w-5 inline mr-2" />
          Start New Training Session
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Choose an agent to train</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Data
            </label>
            <textarea
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              placeholder="Paste conversation examples, FAQs, or specific scenarios you want your agent to learn..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Question/scenario followed by ideal response. Separate multiple examples with line breaks.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleStartTraining}
              disabled={!selectedAgent || !trainingData || isTraining}
            >
              {isTraining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Training...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
            
            <Button variant="outline">
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>
      </div>

      {/* Training Templates */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <DocumentTextIcon className="h-5 w-5 inline mr-2" />
          Training Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Customer Support',
              description: 'Common support queries and responses',
              examples: 245,
            },
            {
              title: 'Sales Qualification',
              description: 'Lead qualification conversations',
              examples: 180,
            },
            {
              title: 'Product Information',
              description: 'Product features and benefits',
              examples: 320,
            },
          ].map((template) => (
            <div key={template.title} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer">
              <h4 className="font-medium text-gray-900">{template.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <p className="text-xs text-blue-600 mt-2">{template.examples} examples</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Training Sessions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Training Sessions</h3>
        </div>
        
        <div className="p-6">
          {trainingSessions.length === 0 ? (
            <div className="text-center py-8">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No training sessions</h3>
              <p className="mt-1 text-sm text-gray-500">Start training your agents to improve their performance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(session.status)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{session.agentName}</h4>
                        <p className="text-xs text-gray-500">
                          Started {new Date(session.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(session.status)}`}>
                      {session.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-900">{session.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Data Points:</span>
                      <span className="ml-1 text-gray-900">{session.dataPoints}</span>
                    </div>
                    {session.accuracy > 0 && (
                      <div>
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="ml-1 text-gray-900">{session.accuracy}%</span>
                      </div>
                    )}
                  </div>

                  {session.status === 'running' && (
                    <div className="mt-4 flex justify-end">
                      <Button size="sm" variant="outline">
                        <PauseIcon className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 