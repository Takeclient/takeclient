'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import ContactDetailsModal from './components/ContactDetailsModal';

type Contact = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  company: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  
  useEffect(() => {
    fetchContacts();
  }, [pagination.page, searchTerm, statusFilter]);
  
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/contacts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data.contacts);
      setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'LEAD', label: 'Lead' },
    { value: 'ANSWERED', label: 'Answered' },
    { value: 'NO_ANSWER', label: 'No Answer' },
    { value: 'SHOW', label: 'Show' },
    { value: 'NO_SHOW', label: 'No Show' },
    { value: 'CONTRACT', label: 'Contract' },
  ];
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'LEAD':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANSWERED':
        return 'bg-blue-100 text-blue-800';
      case 'NO_ANSWER':
        return 'bg-red-100 text-red-800';
      case 'SHOW':
        return 'bg-purple-100 text-purple-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      case 'CONTRACT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  const handleContactClick = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsModalOpen(true);
  };

  const handleContactUpdated = (updatedContact: any) => {
    // Update the contact in the list
    setContacts(prev => 
      prev.map(contact => 
        contact.id === updatedContact.id ? { ...contact, ...updatedContact } : contact
      )
    );
  };
  
  return (
    <div>
      <div className="sm:flex sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your contacts and leads
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/contacts/new">
            <Button type="button">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Contact
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <form onSubmit={handleSearch} className="sm:flex sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sm:w-56">
            <label htmlFor="status-filter" className="sr-only">
              Status
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <select
                id="status-filter"
                name="status-filter"
                className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>
      
      {/* Contact list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">No contacts found matching your criteria</p>
          </div>
        ) : (
          <>
          <ul role="list" className="divide-y divide-gray-200">
              {contacts.map((contact) => (
              <li key={contact.id}>
                <button 
                  onClick={() => handleContactClick(contact.id)}
                  className="w-full text-left block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {contact.firstName.charAt(0)}{contact.lastName?.charAt(0) || ''}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 truncate">
                              {contact.firstName} {contact.lastName || ''}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {contact.company?.name || 'No company'}
                          </p>
                            {contact.source && (
                              <p className="text-xs text-gray-400 mt-1">
                                Source: {contact.source}
                              </p>
                            )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-x-4">
                        {contact.email && (
                          <p className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <PhoneIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Added on {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span> of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else {
                          const offset = Math.min(
                            Math.max(0, pagination.page - 3),
                            Math.max(0, pagination.totalPages - 5)
                          );
                          pageNum = i + 1 + offset;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Details Modal */}
      {selectedContactId && (
        <ContactDetailsModal
          contactId={selectedContactId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContactId(null);
          }}
          onContactUpdated={handleContactUpdated}
        />
      )}
    </div>
  );
}
