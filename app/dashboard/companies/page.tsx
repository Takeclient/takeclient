'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  size: string | null;
  contactCount: number;
  dealCount: number;
  createdAt: string;
};

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real companies from API
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          // Map API response to match component interface
          const mappedCompanies = (data.companies || []).map((company: any) => ({
            id: company.id,
            name: company.name,
            industry: company.industry,
            website: company.website,
            size: company.size,
            contactCount: company._count?.contacts || 0,
            dealCount: company._count?.deals || 0,
            createdAt: company.createdAt,
          }));
          setCompanies(mappedCompanies);
        } else {
          console.error('Failed to fetch companies:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => {
    return searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your company accounts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/companies/new">
            <Button type="button">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Company
            </Button>
          </Link>
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
                placeholder="Search by name, industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Company list */}
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
        ) : filteredCompanies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No companies found matching your criteria</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <li key={company.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/companies/${company.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
                          <BuildingOfficeIcon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {company.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {company.industry || 'No industry specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-gray-500">
                          {company.size || 'Unknown size'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-x-4">
                        {company.website && (
                          <p className="flex items-center text-sm text-gray-500">
                            <GlobeAltIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.website.replace(/(^\w+:|^)\/\//, '')}
                            </a>
                          </p>
                        )}
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {company.contactCount} {company.contactCount === 1 ? 'contact' : 'contacts'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {company.dealCount} {company.dealCount === 1 ? 'deal' : 'deals'}
                        </p>
                      </div>
                    </div>
                  </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
