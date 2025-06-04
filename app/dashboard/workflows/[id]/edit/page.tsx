'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  BoltIcon,
  PlayIcon,
  ClockIcon,
  CogIcon,
  XMarkIcon,
  Square2StackIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Inline Node Components (same as new workflow page)
const TriggerNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg border-2 border-purple-400 min-w-[200px]">
    <div className="p-4">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{data.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{data.label}</h3>
          <p className="text-xs text-purple-100 opacity-90">Trigger</p>
        </div>
        <BoltIcon className="h-5 w-5 text-purple-200" />
      </div>
      {data.description && (
        <p className="text-xs text-purple-100 opacity-80">{data.description}</p>
      )}
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      className="w-3 h-3 bg-white border-2 border-purple-500"
    />
  </div>
);

const ActionNode = ({ data }: any) => {
  // Use dynamic colors based on the action's color property
  const borderColor = data.color || '#3B82F6';
  const handleColor = data.color || '#3B82F6';
  const categoryColor = data.color || '#3B82F6';
  
  return (
    <div 
      className="bg-white rounded-lg shadow-lg border-2 min-w-[200px] hover:shadow-xl transition-shadow"
      style={{ borderColor }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: handleColor }}
      />
      <div className="p-4">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">{data.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">{data.label}</h3>
            <p className="text-xs" style={{ color: categoryColor }}>{data.category || 'Action'}</p>
          </div>
          <CogIcon className="h-5 w-5 text-gray-400" />
        </div>
        {data.description && (
          <p className="text-xs text-gray-600">{data.description}</p>
        )}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-2 flex items-center text-xs text-green-600">
            <CheckIcon className="h-3 w-3 mr-1" />
            Configured
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: handleColor }}
      />
    </div>
  );
};

const ConditionNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg border-2 border-pink-400 min-w-[200px]">
    <Handle
      type="target"
      position={Position.Top}
      className="w-3 h-3 bg-white border-2 border-pink-500"
    />
    <div className="p-4">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{data.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{data.label}</h3>
          <p className="text-xs text-pink-100 opacity-90">Condition</p>
        </div>
        <Square2StackIcon className="h-5 w-5 text-pink-200" />
      </div>
      {data.description && (
        <p className="text-xs text-pink-100 opacity-80">{data.description}</p>
      )}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 flex items-center text-xs text-pink-100">
          <CheckIcon className="h-3 w-3 mr-1" />
          Configured
        </div>
      )}
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="yes"
      style={{ left: '25%' }}
      className="w-3 h-3 bg-green-500 border-2 border-white"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="no"
      style={{ left: '75%' }}
      className="w-3 h-3 bg-red-500 border-2 border-white"
    />
    <div className="absolute bottom-[-24px] left-0 w-full flex justify-between px-4 text-xs font-medium">
      <span className="text-green-600 bg-white px-2 py-1 rounded shadow-sm">YES</span>
      <span className="text-red-600 bg-white px-2 py-1 rounded shadow-sm">NO</span>
    </div>
  </div>
);

const DelayNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg border-2 border-yellow-400 min-w-[200px]">
    <Handle
      type="target"
      position={Position.Top}
      className="w-3 h-3 bg-white border-2 border-yellow-500"
    />
    <div className="p-4">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{data.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{data.label}</h3>
          <p className="text-xs text-yellow-100 opacity-90">Delay</p>
        </div>
        <ClockIcon className="h-5 w-5 text-yellow-200" />
      </div>
      {data.description && (
        <p className="text-xs text-yellow-100 opacity-80">{data.description}</p>
      )}
      <div className="mt-3 bg-yellow-600 bg-opacity-50 rounded px-2 py-1">
        <p className="text-xs text-yellow-100">
          {data.config?.delay ? `⏰ ${data.config.delay} ${data.config.unit || 'minutes'}` : '⏰ Configure delay time'}
        </p>
      </div>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      className="w-3 h-3 bg-white border-2 border-yellow-500"
    />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

// Same trigger and action options as new workflow page
const triggerOptions = [
  {
    category: 'Contacts',
    triggers: [
      { value: 'CONTACT_CREATED', label: 'Contact Created', icon: '👤', description: 'When a new contact is added' },
      { value: 'CONTACT_UPDATED', label: 'Contact Updated', icon: '✏️', description: 'When contact details are changed' },
      { value: 'CONTACT_STAGE_CHANGED', label: 'Stage Changed', icon: '🔄', description: 'When contact moves to a new stage' },
      { value: 'CONTACT_TAG_ADDED', label: 'Tag Added', icon: '🏷️', description: 'When a tag is added to contact' },
      { value: 'CONTACT_SCORE_CHANGED', label: 'Score Changed', icon: '📊', description: 'When lead score changes' },
    ]
  },
  {
    category: 'Deals',
    triggers: [
      { value: 'DEAL_CREATED', label: 'Deal Created', icon: '💰', description: 'When a new deal is created' },
      { value: 'DEAL_STAGE_CHANGED', label: 'Stage Changed', icon: '📈', description: 'When deal moves stages' },
      { value: 'DEAL_WON', label: 'Deal Won', icon: '🎉', description: 'When a deal is marked as won' },
      { value: 'DEAL_LOST', label: 'Deal Lost', icon: '😔', description: 'When a deal is marked as lost' },
    ]
  },
  {
    category: 'Forms & Email',
    triggers: [
      { value: 'FORM_SUBMITTED', label: 'Form Submitted', icon: '📝', description: 'When someone submits a form' },
      { value: 'EMAIL_OPENED', label: 'Email Opened', icon: '📧', description: 'When an email is opened' },
      { value: 'EMAIL_CLICKED', label: 'Link Clicked', icon: '🔗', description: 'When a link is clicked' },
      { value: 'EMAIL_UNSUBSCRIBED', label: 'Unsubscribed', icon: '🚫', description: 'When someone unsubscribes' },
    ]
  },
  {
    category: 'WhatsApp',
    triggers: [
      { value: 'WHATSAPP_MESSAGE_RECEIVED', label: 'Message Received', icon: '💬', description: 'When you receive a WhatsApp message' },
      { value: 'WHATSAPP_CONVERSATION_STARTED', label: 'Conversation Started', icon: '🗨️', description: 'When a new conversation begins' },
    ]
  },
  {
    category: 'Time-Based',
    triggers: [
      { value: 'TIME_BASED', label: 'Specific Date/Time', icon: '⏰', description: 'Run at a specific time' },
      { value: 'RECURRING', label: 'Recurring Schedule', icon: '🔁', description: 'Run on a schedule' },
    ]
  }
];

const actionOptions = [
  {
    category: 'Contact Actions',
    actions: [
      { value: 'UPDATE_CONTACT', label: 'Update Contact', icon: '✏️', description: 'Update contact information', color: '#3B82F6', category: 'Contact Actions' },
      { value: 'UPDATE_CONTACT_STAGE', label: 'Change Stage', icon: '🔄', description: 'Move contact to new stage', color: '#8B5CF6', category: 'Contact Actions' },
      { value: 'ADD_CONTACT_TAG', label: 'Add Tag', icon: '🏷️', description: 'Add a tag to contact', color: '#10B981', category: 'Contact Actions' },
      { value: 'UPDATE_CONTACT_SCORE', label: 'Update Score', icon: '📊', description: 'Increase or decrease score', color: '#F59E0B', category: 'Contact Actions' },
      { value: 'ASSIGN_CONTACT', label: 'Assign Contact', icon: '👥', description: 'Assign contact to team member', color: '#EF4444', category: 'Contact Actions' },
    ]
  },
  {
    category: 'Communication',
    actions: [
      { value: 'SEND_EMAIL', label: 'Send Email', icon: '📧', description: 'Send an email to contact', color: '#3B82F6', category: 'Communication' },
      { value: 'SEND_WHATSAPP', label: 'Send WhatsApp', icon: '💬', description: 'Send WhatsApp message', color: '#10B981', category: 'Communication' },
      { value: 'SEND_NOTIFICATION', label: 'Send Notification', icon: '🔔', description: 'Notify team members', color: '#F59E0B', category: 'Communication' },
    ]
  },
  {
    category: 'CRM Actions',
    actions: [
      { value: 'CREATE_DEAL', label: 'Create Deal', icon: '💰', description: 'Create a new deal', color: '#8B5CF6', category: 'CRM Actions' },
      { value: 'CREATE_TASK', label: 'Create Task', icon: '✅', description: 'Create a task for team', color: '#06B6D4', category: 'CRM Actions' },
      { value: 'CREATE_ACTIVITY', label: 'Log Activity', icon: '📝', description: 'Log an activity', color: '#84CC16', category: 'CRM Actions' },
    ]
  },
  {
    category: 'Control Flow',
    actions: [
      { value: 'WAIT', label: 'Wait/Delay', icon: '⏱️', description: 'Wait before next action', color: '#6B7280', category: 'Control Flow' },
      { value: 'BRANCH_CONDITION', label: 'If/Then Branch', icon: '🔀', description: 'Conditional branching', color: '#EC4899', category: 'Control Flow' },
    ]
  }
];

export default function EditWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params.id as string;
  
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'triggers' | 'actions'>('triggers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any pending operations
      setSelectedNode(null);
      setIsSubmitting(false);
    };
  }, []);

  // Load existing workflow data
  useEffect(() => {
    async function loadWorkflow() {
      try {
        const response = await fetch(`/api/workflows/${workflowId}`);
        if (!response.ok) {
          throw new Error('Failed to load workflow');
        }
        
        const data = await response.json();
        const workflow = data.workflow;
        
        setWorkflow(workflow);
        setWorkflowName(workflow.name);
        setWorkflowDescription(workflow.description || '');
        
        // Load visual workflow metadata if it exists
        const visualMetadata = workflow.triggerConfig?.visualWorkflowMetadata;
        if (visualMetadata?.nodes && visualMetadata?.edges) {
          setNodes(visualMetadata.nodes);
          setEdges(visualMetadata.edges);
        } else {
          // Convert database format to visual format
          await convertToVisualFormat(workflow);
        }
        
      } catch (error) {
        console.error('Error loading workflow:', error);
        toast.error('Failed to load workflow');
        router.push('/dashboard/workflows');
      } finally {
        setIsLoading(false);
      }
    }

    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId, router, setNodes, setEdges]);

  // Convert database workflow to visual format
  const convertToVisualFormat = async (workflow: any) => {
    const visualNodes: Node[] = [];
    const visualEdges: Edge[] = [];

    // Create trigger node
    const triggerOption = triggerOptions
      .flatMap(cat => cat.triggers)
      .find(t => t.value === workflow.triggerType);

    if (triggerOption) {
      // Extract clean trigger config (without visual metadata)
      const cleanTriggerConfig = { ...workflow.triggerConfig };
      delete cleanTriggerConfig.visualWorkflowMetadata;
      
      visualNodes.push({
        id: `trigger-${Date.now()}`,
        type: 'trigger',
        position: { x: 400, y: 50 },
        data: {
          id: `trigger-${Date.now()}`,
          type: workflow.triggerType,
          label: triggerOption.label,
          icon: triggerOption.icon,
          description: triggerOption.description,
          config: cleanTriggerConfig,
        },
      });
    }

    // Create action nodes from workflow actions
    workflow.actions?.forEach((action: any, index: number) => {
      const actionOption = actionOptions
        .flatMap(cat => cat.actions)
        .find(a => a.value === action.type);

      if (actionOption) {
        // Determine the correct ReactFlow node type
        let reactFlowNodeType = 'action'; // Default to action
        if (action.type === 'WAIT') {
          reactFlowNodeType = 'delay';
        } else if (action.type === 'BRANCH_CONDITION') {
          reactFlowNodeType = 'condition';
        }

        const nodeData = {
          id: `action-${action.id}`,
          type: action.type, // Keep the database action type in data
          label: actionOption.label,
          icon: actionOption.icon,
          description: actionOption.description,
          config: action.config || {},
          category: actionOption.category,
          color: actionOption.color, // Ensure color is explicitly set
        };

        visualNodes.push({
          id: `action-${action.id}`,
          type: reactFlowNodeType, // Use the correct ReactFlow node type
          position: { x: 400, y: 250 + (index * 150) },
          data: nodeData,
        });
      }
    });

    // Create simple linear edges
    for (let i = 0; i < visualNodes.length - 1; i++) {
      visualEdges.push({
        id: `edge-${i}`,
        source: visualNodes[i].id,
        target: visualNodes[i + 1].id,
      });
    }

    setNodes(visualNodes);
    setEdges(visualEdges);
  };

  // Helper function to auto-arrange nodes vertically
  const autoArrangeNodes = useCallback((newNodes: Node[]) => {
    const triggerNode = newNodes.find(n => n.type === 'trigger');
    const otherNodes = newNodes.filter(n => n.type !== 'trigger').sort((a, b) => {
      const timeA = parseInt(a.id.split('-')[1] || '0');
      const timeB = parseInt(b.id.split('-')[1] || '0');
      return timeA - timeB;
    });
    
    const arrangedNodes = [...newNodes];
    
    if (triggerNode) {
      arrangedNodes.forEach(node => {
        if (node.id === triggerNode.id) {
          node.position = { x: 400, y: 50 };
        }
      });
    }
    
    otherNodes.forEach((node, index) => {
      const nodeInArray = arrangedNodes.find(n => n.id === node.id);
      if (nodeInArray) {
        nodeInArray.position = { 
          x: 400, 
          y: 250 + (index * 150)
        };
      }
    });
    
    return arrangedNodes;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addTriggerNode = useCallback((trigger: any) => {
    const id = `trigger-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'trigger',
      position: { x: 400, y: 50 },
      data: {
        id,
        type: trigger.value,
        label: trigger.label,
        icon: trigger.icon,
        description: trigger.description,
        config: {},
      },
    };

    setNodes((nds) => {
      const withoutTrigger = nds.filter(n => n.type !== 'trigger');
      const newNodes = [...withoutTrigger, newNode];
      return autoArrangeNodes(newNodes);
    });
  }, [setNodes, autoArrangeNodes]);

  const addActionNode = useCallback((action: any) => {
    const id = `action-${Date.now()}`;
    
    const newNode: Node = {
      id,
      type: action.value === 'WAIT' ? 'delay' : action.value === 'BRANCH_CONDITION' ? 'condition' : 'action',
      position: { x: 400, y: 250 },
      data: {
        id,
        type: action.value,
        label: action.label,
        icon: action.icon,
        description: action.description,
        config: {},
        category: action.category,
        color: action.color,
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      return autoArrangeNodes(newNodes);
    });
  }, [setNodes, autoArrangeNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const filtered = nds.filter(n => n.id !== nodeId);
      return autoArrangeNodes(filtered);
    });
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges, autoArrangeNodes]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, [setNodes]);

  const handleSubmit = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
      toast.error('Please add a trigger to start your workflow');
      return;
    }

    const actionNodes = nodes.filter(n => n.type !== 'trigger');
    if (actionNodes.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    if (isSubmitting || isNavigating) return;

    setIsSubmitting(true);

    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription || '',
        triggerType: triggerNode.data.type,
        triggerConfig: triggerNode.data.config || {},
        steps: actionNodes.map((node, index) => ({
          type: node.data.type,
          config: node.data.config || {},
          order: index + 1,
        })),
        isActive: workflow?.isActive || false,
        metadata: {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.data.type,
            position: node.position,
            data: node.data,
          })),
          edges: edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
          })),
        }
      };

      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      toast.success('Workflow updated successfully!');
      setIsNavigating(true);
      
      // Add small delay to prevent React DOM errors during navigation
      setTimeout(() => {
        router.push('/dashboard/workflows');
      }, 100);
    } catch (error: any) {
      console.error('Error updating workflow:', error);
      toast.error(error.message || 'Failed to update workflow. Please try again.');
    } finally {
      if (!isNavigating) {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/dashboard/workflows')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <BoltIcon className="h-6 w-6 text-purple-600 mr-2" />
              Edit Workflow
            </h1>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name..."
              className="mt-1 text-sm text-gray-600 border-none outline-none bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            {sidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => router.push('/dashboard/workflows')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isNavigating || nodes.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redirecting...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Same as new workflow page */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('triggers')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg ${
                    activeTab === 'triggers'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚡ Triggers
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg ${
                    activeTab === 'actions'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎯 Actions
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'triggers' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Choose a trigger to start your workflow
                  </h3>
                  {triggerOptions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {category.category}
                      </h4>
                      {category.triggers.map((trigger) => (
                        <button
                          key={trigger.value}
                          onClick={() => addTriggerNode(trigger)}
                          className="w-full flex items-start p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left transition-colors"
                        >
                          <span className="text-xl mr-3">{trigger.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{trigger.label}</h5>
                            <p className="text-xs text-gray-500 mt-1">{trigger.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Add actions to your workflow
                  </h3>
                  {actionOptions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {category.category}
                      </h4>
                      {category.actions.map((action) => (
                        <button
                          key={action.value}
                          onClick={() => addActionNode(action)}
                          className="w-full flex items-start p-3 border border-gray-200 rounded-lg hover:shadow-md text-left transition-all duration-200"
                          style={{
                            borderColor: action.color,
                            backgroundColor: `${action.color}10`,
                          }}
                        >
                          <span className="text-xl mr-3">{action.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{action.label}</h5>
                            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
            
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                  <BoltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Edit Your Workflow
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Modify your workflow by adding, removing, or configuring triggers and actions.
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Node Configuration Panel - Same component as new workflow page */}
        {selectedNode && (
          <NodeConfigurationPanel 
            node={selectedNode} 
            onUpdate={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}

// Node Configuration Panel Component (same as new workflow page)
function NodeConfigurationPanel({ 
  node, 
  onUpdate, 
  onDelete, 
  onClose 
}: {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState(node.data.config || {});

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(node.id, { config: newConfig });
  };

  const renderConfigForm = () => {
    switch (node.data.type) {
      case 'SEND_EMAIL':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={config.templateId || ''}
                onChange={(e) => handleConfigChange('templateId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select template...</option>
                <option value="welcome">Welcome Email</option>
                <option value="followup">Follow-up Email</option>
                <option value="newsletter">Newsletter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                placeholder="Email subject..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Before Sending
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={config.delay || ''}
                  onChange={(e) => handleConfigChange('delay', e.target.value)}
                  placeholder="0"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={config.delayUnit || 'minutes'}
                  onChange={(e) => handleConfigChange('delayUnit', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'WAIT':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wait Duration
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={config.delay || ''}
                  onChange={(e) => handleConfigChange('delay', e.target.value)}
                  placeholder="Enter duration..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={config.unit || 'minutes'}
                  onChange={(e) => handleConfigChange('unit', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'UPDATE_CONTACT_STAGE':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stage
              </label>
              <select
                value={config.stageId || ''}
                onChange={(e) => handleConfigChange('stageId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select stage...</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        );

      case 'ADD_CONTACT_TAG':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag to Add
              </label>
              <input
                type="text"
                value={config.tag || ''}
                onChange={(e) => handleConfigChange('tag', e.target.value)}
                placeholder="Enter tag name..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 'BRANCH_CONDITION':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition Field
              </label>
              <select
                value={config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select field...</option>
                <option value="score">Lead Score</option>
                <option value="stage">Contact Stage</option>
                <option value="tags">Tags</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operator
              </label>
              <select
                value={config.operator || ''}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select operator...</option>
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                placeholder="Enter comparison value..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Configuration options for this action will be available soon.
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {node.data.icon} {node.data.label}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDelete(node.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <p className="text-sm text-gray-600">{node.data.description}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configuration
          </label>
          <div className="space-y-3">
            {renderConfigForm()}
          </div>
        </div>
      </div>
    </div>
  );
} 