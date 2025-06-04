'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
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
}

interface PipelineStats {
  totalValue: number;
  totalDeals: number;
  averageDealSize: number;
  conversionRate: number;
  averageSalesCycle: number;
  stageStats: {
    [stageId: string]: {
      count: number;
      value: number;
      averageTime: number;
    };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

const DEFAULT_STAGES = [
  { id: 'PROSPECTING', name: 'Prospecting', color: '#6B7280', order: 1 },
  { id: 'QUALIFICATION', name: 'Qualification', color: '#3B82F6', order: 2 },
  { id: 'PROPOSAL', name: 'Proposal', color: '#8B5CF6', order: 3 },
  { id: 'NEGOTIATION', name: 'Negotiation', color: '#F59E0B', order: 4 },
  { id: 'CLOSED_WON', name: 'Closed Won', color: '#10B981', order: 5 },
  { id: 'CLOSED_LOST', name: 'Closed Lost', color: '#EF4444', order: 6 },
];

export default function SalesPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    owner: '',
    source: '',
    dateRange: '',
  });

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setIsLoading(true);
      const [dealsRes, statsRes, usersRes] = await Promise.all([
        fetch('/api/deals?limit=1000'), // Get all deals for pipeline view
        fetch('/api/deals/pipeline/stats'),
        fetch('/api/users'),
      ]);

      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        // Convert value from cents to dollars for display
        const processedDeals = (dealsData.deals || dealsData).map((deal: Deal) => ({
          ...deal,
          value: deal.value / 100,
        }));
        setDeals(processedDeals);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
      toast.error('Failed to load pipeline data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === targetStage) {
      setDraggedDeal(null);
      return;
    }

    try {
      const response = await fetch(`/api/deals/${draggedDeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage }),
      });

      if (response.ok) {
        toast.success('Deal moved successfully');
        // Update the deal in local state immediately for better UX
        setDeals(prevDeals => 
          prevDeals.map(deal => 
            deal.id === draggedDeal.id 
              ? { ...deal, stage: targetStage }
              : deal
          )
        );
        // Reload data to get fresh stats
        loadPipelineData();
      } else {
        toast.error('Failed to move deal');
      }
    } catch (error) {
      console.error('Error moving deal:', error);
      toast.error('Failed to move deal');
    }

    setDraggedDeal(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getDaysUntilClose = (closeDate?: string) => {
    if (!closeDate) return null;
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStageDeals = (stageId: string) => {
    return filteredDeals.filter(deal => deal.stage === stageId);
  };

  const filteredDeals = deals.filter(deal => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        deal.name.toLowerCase().includes(searchLower) ||
        deal.company?.name.toLowerCase().includes(searchLower) ||
        deal.contact?.firstName.toLowerCase().includes(searchLower) ||
        (deal.contact?.lastName && deal.contact.lastName.toLowerCase().includes(searchLower)) ||
        (deal.contact?.email && deal.contact.email.toLowerCase().includes(searchLower)) ||
        (deal.description && deal.description.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    if (filters.owner && deal.owner?.id !== filters.owner) return false;
    if (filters.source && deal.source !== filters.source) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FunnelIcon className="h-7 w-7 text-blue-600 mr-3" />
              Sales Pipeline
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize and manage your sales opportunities
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            <Link
              href="/dashboard/deals/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Deal
            </Link>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue / 100)}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
              </div>
              <FunnelIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageDealSize / 100)}</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.conversionRate)}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sales Cycle</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageSalesCycle} days</p>
              </div>
              <ClockIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Deals
            </label>
            <input
              type="text"
              placeholder="Search by name, company, contact..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Owner
            </label>
            <select
              value={filters.owner}
              onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Owners</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Social Media">Social Media</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Partner">Partner</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', owner: '', source: '', dateRange: '' })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pipeline Board</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredDeals.length} of {deals.length} deals
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {DEFAULT_STAGES.map((stage) => {
              const stageDeals = getStageDeals(stage.id);
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              
              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className="bg-gray-50 rounded-t-lg p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-medium text-gray-900">{stage.name}</h3>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {stageDeals.length}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(stageValue)}
                      </p>
                    </div>
                  </div>

                  {/* Stage Deals */}
                  <div className="bg-gray-50 rounded-b-lg min-h-96 p-4 space-y-3">
                    {stageDeals.map((deal) => {
                      const daysUntilClose = getDaysUntilClose(deal.closeDate);
                      const isOverdue = daysUntilClose !== null && daysUntilClose < 0;
                      
                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={() => handleDragStart(deal)}
                          className="bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-shadow border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {deal.name}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              <Link
                                href={`/dashboard/deals/${deal.id}`}
                                className="text-gray-400 hover:text-blue-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/dashboard/deals/${deal.id}/edit`}
                                className="text-gray-400 hover:text-gray-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-green-600">
                                {formatCurrency(deal.value)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {deal.probability}%
                              </span>
                            </div>
                            
                            {deal.company && (
                              <div className="flex items-center text-sm text-gray-600">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {deal.company.name}
                              </div>
                            )}
                            
                            {deal.contact && (
                              <div className="flex items-center text-sm text-gray-600">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {deal.contact.firstName} {deal.contact.lastName}
                              </div>
                            )}

                            {deal.owner && (
                              <div className="flex items-center text-sm text-gray-600">
                                <UserIcon className="h-4 w-4 mr-1" />
                                Owner: {deal.owner.name}
                              </div>
                            )}
                            
                            {deal.closeDate && (
                              <div className={`flex items-center text-sm ${
                                isOverdue ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(deal.closeDate).toLocaleDateString()}
                                {daysUntilClose !== null && (
                                  <span className="ml-1">
                                    ({isOverdue ? `${Math.abs(daysUntilClose)} days overdue` : `${daysUntilClose} days`})
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {deal.tags && deal.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {deal.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {deal.tags.length > 2 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{deal.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FunnelIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No deals in this stage</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 