'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  useReactFlow,
  ReactFlowProvider,
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
  DocumentDuplicateIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { enhancedTriggers, enhancedActions, workflowTemplates } from '@/app/lib/workflow-templates';
import { getNodeConfig } from '@/app/lib/workflow-node-configs';

// Inline Node Components to avoid import issues
const TriggerNode = ({ data }: any) => (
  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg border-2 border-purple-400 min-w-[180px] max-w-[220px]">
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
      className="bg-white rounded-lg shadow-lg border-2 min-w-[180px] max-w-[220px] hover:shadow-xl transition-shadow"
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
  <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg border-2 border-pink-400 min-w-[180px] max-w-[220px]">
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
  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg border-2 border-yellow-400 min-w-[180px] max-w-[220px]">
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

interface WorkflowNodeData {
  id: string;
  type: string;
  label: string;
  icon: string;
  description?: string;
  config: any;
  category?: string;
  color?: string;
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const triggerOptions = [
  {
    category: 'CRM',
    triggers: enhancedTriggers.CRM,
  },
  {
    category: 'Marketing',
    triggers: enhancedTriggers.Marketing,
  },
  {
    category: 'Sales',
    triggers: enhancedTriggers.Sales,
  },
  {
    category: 'Ecommerce',
    triggers: enhancedTriggers.Ecommerce,
  },
];

const actionOptions = [
  {
    category: 'CRM Actions',
    actions: enhancedActions.CRM.map(a => ({ ...a, category: 'CRM Actions' })),
  },
  {
    category: 'Marketing',
    actions: enhancedActions.Marketing.map(a => ({ ...a, category: 'Marketing' })),
  },
  {
    category: 'Sales',
    actions: enhancedActions.Sales.map(a => ({ ...a, category: 'Sales' })),
  },
  {
    category: 'Ecommerce',
    actions: enhancedActions.Ecommerce.map(a => ({ ...a, category: 'Ecommerce' })),
  },
  {
    category: 'Control Flow',
    actions: enhancedActions.ControlFlow.map(a => ({ ...a, category: 'Control Flow' })),
  },
];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function WorkflowBuilder() {
  const router = useRouter();
  const { getViewport, setCenter, fitView, project } = useReactFlow();
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'triggers' | 'actions' | 'templates'>('templates');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any pending operations
      setSelectedNode(null);
      setIsSubmitting(false);
    };
  }, []);

  // Handle ReactFlow initialization to prevent auto-scrolling
  const handleInit = useCallback((reactFlowInstance: any) => {
    // Set initial viewport to center on components (offset to show x:400 as center)
    reactFlowInstance.setViewport({ x: -200, y: 200, zoom: 1 });
  }, []);

  // Helper function to get a simple position
  const getNodePosition = useCallback(() => {
    // Count existing nodes to position new ones
    const nodeCount = nodes.length;
    
    // Position nodes centered in visible area
    return {
      x: 400, // Center horizontally in viewport
      y: 150 + (nodeCount * 150), // Stack vertically from top of visible area
    };
  }, [nodes]);

  // Helper function to auto-arrange nodes vertically
  const autoArrangeNodes = useCallback((newNodes: Node[]) => {
    const triggerNode = newNodes.find(n => n.type === 'trigger');
    const otherNodes = newNodes.filter(n => n.type !== 'trigger').sort((a, b) => {
      // Sort by creation time (using timestamp from ID)
      const timeA = parseInt(a.id.split('-')[1] || '0');
      const timeB = parseInt(b.id.split('-')[1] || '0');
      return timeA - timeB;
    });
    
    const arrangedNodes = [...newNodes];
    
    // Position trigger at top center
    if (triggerNode) {
      arrangedNodes.forEach(node => {
        if (node.id === triggerNode.id) {
          node.position = { x: 400, y: 100 };
        }
      });
    }
    
    // Position other nodes below with proper spacing
    otherNodes.forEach((node, index) => {
      const nodeInArray = arrangedNodes.find(n => n.id === node.id);
      if (nodeInArray) {
        nodeInArray.position = { 
          x: 400, 
          y: 250 + (index * 150) // Start after trigger with consistent spacing
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
    
    // Position trigger node at top center of visible area
    const position = { x: 400, y: 100 }; // Center horizontally in viewport, at top of visible area
    
    const newNode: Node = {
      id,
      type: 'trigger',
      position,
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
      // Remove existing trigger node if any
      const withoutTrigger = nds.filter(n => n.type !== 'trigger');
      const newNodes = [...withoutTrigger, newNode];
      
      // No automatic fitView - keep components visible where placed
      return newNodes;
    });
  }, [setNodes, fitView]);

  const addActionNode = useCallback((action: any) => {
    const id = `action-${Date.now()}`;
    
    // Position action node
    const position = getNodePosition(); // Stack below existing nodes
    
    const newNode: Node = {
      id,
      type: action.value === 'WAIT' ? 'delay' : action.value === 'BRANCH_CONDITION' ? 'condition' : 'action',
      position,
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
      
      // No automatic fitView - keep components visible where placed
      return newNodes;
    });
  }, [setNodes, getNodePosition, fitView]);

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
      console.log('Creating workflow with data:', {
        name: workflowName,
        description: workflowDescription,
        triggerType: triggerNode.data.type,
        triggerConfig: triggerNode.data.config,
        nodes: nodes.length,
        edges: edges.length
      });

      // Convert visual workflow to proper format
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
        isActive: false,
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

      console.log('Sending workflow data:', workflowData);

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        if (result.planLimitReached) {
          // Handle plan limit errors with upgrade suggestion
          toast.error(
            <div className="space-y-2">
              <div className="font-medium">Workflow Limit Reached</div>
              <div className="text-sm">
                {result.message || 'You have reached your workflow automation limit.'}
              </div>
              <div className="text-xs text-gray-600">
                Current usage: {result.currentUsage}/{result.limit} workflows
              </div>
              <button 
                onClick={() => router.push('/dashboard/billing')}
                className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
              >
                Upgrade Plan
              </button>
            </div>,
            { duration: 8000 }
          );
          return;
        }
        
        if (response.status === 401) {
          toast.error('Authentication required. Please log in again.');
          setIsNavigating(true);
          router.push('/login');
          return;
        }
        
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      toast.success('Workflow created successfully!');
      setIsNavigating(true);
      
      // Add small delay to prevent React DOM errors during navigation
      setTimeout(() => {
        router.push('/dashboard/workflows');
      }, 100);
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast.error(error.message || 'Failed to create workflow. Please try again.');
    } finally {
      if (!isNavigating) {
        setIsSubmitting(false);
      }
    }
  };

  const loadTemplate = useCallback((template: any) => {
    // Clear existing nodes
    setNodes([]);
    setEdges([]);
    
    // Set workflow details
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Add trigger node
    const triggerData = enhancedTriggers[template.category as keyof typeof enhancedTriggers]
      ?.find(t => t.value === template.triggerType) || 
      Object.values(enhancedTriggers).flat().find(t => t.value === template.triggerType);
    
    if (triggerData) {
      const triggerId = `trigger-${Date.now()}`;
      newNodes.push({
        id: triggerId,
        type: 'trigger',
        position: { x: 400, y: 100 },
        data: {
          id: triggerId,
          type: template.triggerType,
          label: triggerData.label,
          icon: triggerData.icon,
          description: triggerData.description,
          config: template.triggerConfig,
        },
      });
      
      // Add action nodes
      let previousNodeId = triggerId;
      template.actions.forEach((action: any, index: number) => {
        const actionData = Object.values(enhancedActions).flat()
          .find(a => a.value === action.type);
        
        if (actionData) {
          const actionId = `action-${Date.now()}-${index}`;
          const nodeType = action.type === 'WAIT' ? 'delay' : 
                          action.type === 'BRANCH_CONDITION' ? 'condition' : 'action';
          
          newNodes.push({
            id: actionId,
            type: nodeType,
            position: { x: 400, y: 250 + (index * 150) },
            data: {
              id: actionId,
              type: action.type,
              label: actionData.label,
              icon: actionData.icon,
              description: actionData.description,
              config: action.config,
              color: actionData.color,
              category: actionData.category,
            },
          });
          
          // Create edge
          newEdges.push({
            id: `edge-${previousNodeId}-${actionId}`,
            source: previousNodeId,
            target: actionId,
          });
          
          previousNodeId = actionId;
        }
      });
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
    setShowTemplateModal(false);
    setActiveTab('triggers');
    
    // Only fit view for templates if there are multiple nodes
    if (newNodes.length > 1) {
      setTimeout(() => {
        fitView({ padding: 0.15, duration: 500, maxZoom: 1.2 });
      }, 500);
    }
    
    toast.success('Template loaded successfully!');
  }, [setNodes, setEdges]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') return workflowTemplates;
    return workflowTemplates.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  // Check for template parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');
    
    if (templateId) {
      const template = workflowTemplates.find(t => t.id === templateId);
      if (template) {
        loadTemplate(template);
      }
    }
  }, [loadTemplate]);

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
              Visual Workflow Builder
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
                Creating...
              </>
            ) : isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redirecting...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Save Workflow
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Enhanced Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex p-2 space-x-1">
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'templates'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                  Templates
                </button>
                <button
                  onClick={() => setActiveTab('triggers')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'triggers'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BoltIcon className="h-4 w-4 inline mr-1" />
                  Triggers
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'actions'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <CogIcon className="h-4 w-4 inline mr-1" />
                  Actions
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'templates' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Workflow Templates
                    </h3>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All Categories</option>
                      <option value="CRM">CRM</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Ecommerce">Ecommerce</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                      >
                        <div className="flex items-start">
                          <span className="text-2xl mr-3">{template.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-sm text-gray-900">
                                {template.name}
                              </h4>
                              {template.isPremium && (
                                <SparklesIcon className="h-4 w-4 text-yellow-500 ml-2" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {template.category}
                              </span>
                              <span className="text-xs text-gray-400">
                                {template.actions.length} steps
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'triggers' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Choose a trigger to start your workflow
                  </h3>
                  {triggerOptions.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                        {category.category}
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {category.triggers.length}
                        </span>
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
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                        {category.category}
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {category.actions.length}
                        </span>
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
            onInit={handleInit}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: -200, y: 200, zoom: 1 }}
            className="bg-gray-50"
            preventScrolling={false}
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
            
            {/* Canvas Instructions */}
            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
                  <BoltIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start Building Your Workflow
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose from pre-built templates or add a trigger from the sidebar to begin creating your automated workflow.
                  </p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Browse Templates
                  </button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Node Configuration Panel */}
        {selectedNode && (
          <NodeConfigurationPanel 
            node={selectedNode} 
            onUpdate={updateNodeData}
            onDelete={deleteNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Template Preview Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="text-2xl mr-3">{selectedTemplate.icon}</span>
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Workflow Steps</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <BoltIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-sm">Trigger: {selectedTemplate.triggerType}</p>
                        <p className="text-xs text-gray-600">Starts when this event occurs</p>
                      </div>
                    </div>
                    {selectedTemplate.actions.map((action: any, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.name}</p>
                          <p className="text-xs text-gray-600">{action.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedTemplate.benefits && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Benefits</h3>
                    <ul className="space-y-1">
                      {selectedTemplate.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Estimated time: {selectedTemplate.estimatedTime}</span>
                  <div className="flex gap-2">
                    {selectedTemplate.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => loadTemplate(selectedTemplate)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with ReactFlow provider
export default function NewWorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}

// Node Configuration Panel Component
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
    return getNodeConfig(node.data.type, node.data, handleConfigChange);
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