'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

type Deal = {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string | null;
  company: {
    id: string;
    name: string;
  } | null;
  contact: {
    id: string;
    firstName: string;
    lastName?: string;
  } | null;
  createdAt: string;
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/deals?limit=1000');
        
        if (response.ok) {
          const dealsData = await response.json();
          // Convert value from cents to dollars for display
          const formattedDeals = dealsData.deals.map((deal: any) => ({
            ...deal,
            value: deal.value / 100,
          }));
          setDeals(formattedDeals);
        } else {
          toast.error('Failed to load deals');
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast.error('Failed to load deals');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeals();
  }, []);
  
  // Filter deals based on search term and stage
  const filteredDeals = deals.filter(deal => {
    const contactName = deal.contact 
      ? `${deal.contact.firstName} ${deal.contact.lastName || ''}`.trim()
      : '';
    
    const matchesSearch = searchTerm === '' || 
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contactName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStage = stageFilter === 'ALL' || deal.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });
  
  const stageOptions = [
    { value: 'ALL', label: 'All Stages' },
    { value: 'PROSPECTING', label: 'Prospecting' },
    { value: 'QUALIFICATION', label: 'Qualification' },
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'CLOSED_WON', label: 'Closed Won' },
    { value: 'CLOSED_LOST', label: 'Closed Lost' },
  ];
  
  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'PROSPECTING':
        return 'bg-gray-100 text-gray-800';
      case 'QUALIFICATION':
        return 'bg-blue-100 text-blue-800';
      case 'PROPOSAL':
        return 'bg-indigo-100 text-indigo-800';
      case 'NEGOTIATION':
        return 'bg-purple-100 text-purple-800';
      case 'CLOSED_WON':
        return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your sales pipeline
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link href="/dashboard/deals/pipeline">
            <Button variant="outline" type="button">
              <ArrowTrendingUpIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Pipeline View
            </Button>
          </Link>
          <Link href="/dashboard/deals/new">
            <Button type="button">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Pipeline Summary */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Pipeline Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs font-medium text-gray-500">Open Deals</p>
            <p className="text-lg font-semibold text-gray-900">
              {deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage)).length}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs font-medium text-gray-500">Pipeline Value</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage))
                  .reduce((sum, deal) => sum + deal.value, 0)
              )}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs font-medium text-green-600">Won Deals</p>
            <p className="text-lg font-semibold text-green-700">
              {formatCurrency(
                deals.filter(d => d.stage === 'CLOSED_WON')
                  .reduce((sum, deal) => sum + deal.value, 0)
              )}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-xs font-medium text-red-600">Lost Deals</p>
            <p className="text-lg font-semibold text-red-700">
              {formatCurrency(
                deals.filter(d => d.stage === 'CLOSED_LOST')
                  .reduce((sum, deal) => sum + deal.value, 0)
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <div className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-56">
            <label htmlFor="stage-filter" className="sr-only">
              Stage
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="stage-filter"
                name="stage-filter"
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deal list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No deals found matching your criteria</p>
            {deals.length === 0 && (
              <div className="mt-4">
                <Link href="/dashboard/deals/new">
                  <Button type="button">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create your first deal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredDeals.map((deal) => {
              const contactName = deal.contact 
                ? `${deal.contact.firstName} ${deal.contact.lastName || ''}`.trim()
                : null;
              
              return (
                <li key={deal.id}>
                  <Link href={`/dashboard/deals/${deal.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                            <CurrencyDollarIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {deal.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatCurrency(deal.value)} · {deal.probability}% probability
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageBadgeColor(deal.stage)}`}>
                            {deal.stage.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-4">
                          {deal.company && (
                            <p className="flex items-center text-sm text-gray-500">
                              <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {deal.company.name}
                            </p>
                          )}
                          {contactName && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {contactName}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          <p>
                            {deal.closeDate 
                              ? `Closing: ${new Date(deal.closeDate).toLocaleDateString()}` 
                              : 'No close date'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
