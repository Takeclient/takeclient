'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  DocumentArrowUpIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface EmailList {
  id: string;
  name: string;
  description?: string;
  doubleOptIn: boolean;
  _count: {
    subscribers: number;
  };
}

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  company?: {
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
  email?: string;
}

interface Deal {
  id: string;
  name: string;
  contact?: {
    firstName: string;
    lastName?: string;
    email: string;
  };
  company?: {
    name: string;
    email?: string;
  };
}

export default function ImportSubscribersPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  
  const [list, setList] = useState<EmailList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importSource, setImportSource] = useState<'csv' | 'contacts' | 'companies' | 'deals'>('csv');
  
  // Data sources
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // CSV import
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [csvMapping, setCsvMapping] = useState({
    email: 0,
    firstName: -1,
    lastName: -1,
  });

  useEffect(() => {
    if (listId) {
      fetchListData();
    }
  }, [listId]);

  useEffect(() => {
    if (importSource !== 'csv') {
      fetchImportData();
    }
  }, [importSource]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email-marketing/lists/${listId}`);
      if (response.ok) {
        const data = await response.json();
        setList(data.list);
      } else if (response.status === 404) {
        toast.error('Email list not found');
        router.push('/dashboard/email-marketing/lists');
      } else {
        toast.error('Failed to load email list');
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Failed to load email list');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchImportData = async () => {
    try {
      switch (importSource) {
        case 'contacts':
          const contactsResponse = await fetch('/api/contacts');
          if (contactsResponse.ok) {
            const contactsData = await contactsResponse.json();
            setContacts(contactsData.contacts.filter((c: Contact) => c.email));
          }
          break;
        case 'companies':
          const companiesResponse = await fetch('/api/companies');
          if (companiesResponse.ok) {
            const companiesData = await companiesResponse.json();
            setCompanies(companiesData.companies.filter((c: Company) => c.email));
          }
          break;
        case 'deals':
          const dealsResponse = await fetch('/api/deals');
          if (dealsResponse.ok) {
            const dealsData = await dealsResponse.json();
            setDeals(dealsData.deals.filter((d: Deal) => 
              d.contact?.email || d.company?.email
            ));
          }
          break;
      }
    } catch (error) {
      console.error('Error fetching import data:', error);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6); // Preview first 6 lines
      const preview = lines.map(line => line.split(',').map(cell => cell.trim()));
      setCsvPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importSource === 'csv' && !csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    if (importSource !== 'csv' && selectedItems.length === 0) {
      toast.error('Please select items to import');
      return;
    }

    try {
      setIsImporting(true);

      if (importSource === 'csv') {
        const formData = new FormData();
        formData.append('file', csvFile!);
        formData.append('mapping', JSON.stringify(csvMapping));
        
        const response = await fetch(`/api/email-marketing/lists/${listId}/import/csv`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'CSV import failed');
        }

        const result = await response.json();
        toast.success(`Successfully imported ${result.imported} subscribers`);
      } else {
        const importData = {
          source: importSource,
          [`${importSource}Ids`]: selectedItems,
        };

        const response = await fetch(`/api/email-marketing/lists/${listId}/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Import failed');
        }

        const result = await response.json();
        toast.success(`Successfully imported ${result.imported} subscribers`);
      }

      router.push(`/dashboard/email-marketing/lists/${listId}`);
    } catch (error: any) {
      console.error('Error importing subscribers:', error);
      toast.error(error.message || 'Failed to import subscribers');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    let allIds: string[] = [];
    switch (importSource) {
      case 'contacts':
        allIds = contacts.map(c => c.id);
        break;
      case 'companies':
        allIds = companies.map(c => c.id);
        break;
      case 'deals':
        allIds = deals.map(d => d.id);
        break;
    }
    setSelectedItems(allIds);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const getImportCount = () => {
    switch (importSource) {
      case 'contacts':
        return contacts.length;
      case 'companies':
        return companies.length;
      case 'deals':
        return deals.length;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Email list not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The email list you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link href="/dashboard/email-marketing/lists">
            <Button>
              Back to Email Lists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/email-marketing/lists/${listId}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to {list.name}
        </Link>
        
        <div className="flex items-center">
          <ArrowUpTrayIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Subscribers</h1>
            <p className="text-sm text-gray-500">Add subscribers to "{list.name}"</p>
          </div>
        </div>
      </div>

      {/* List Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium">Importing to: {list.name}</p>
            <div className="mt-1 text-blue-700">
              Current subscribers: <span className="font-semibold">{list._count.subscribers}</span>
              {list.doubleOptIn && (
                <span className="ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Double Opt-in Enabled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Import Source Selection */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Choose Import Source</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => {
                setImportSource('csv');
                setSelectedItems([]);
              }}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                importSource === 'csv'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DocumentArrowUpIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">CSV File</div>
              <div className="text-xs text-gray-500">Upload a CSV file</div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setImportSource('contacts');
                setSelectedItems([]);
              }}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                importSource === 'contacts'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Contacts</div>
              <div className="text-xs text-gray-500">{contacts.length} available</div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setImportSource('companies');
                setSelectedItems([]);
              }}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                importSource === 'companies'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <BuildingOfficeIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Companies</div>
              <div className="text-xs text-gray-500">{companies.length} available</div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setImportSource('deals');
                setSelectedItems([]);
              }}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                importSource === 'deals'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CurrencyDollarIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium">Deals</div>
              <div className="text-xs text-gray-500">{deals.length} available</div>
            </button>
          </div>
        </div>

        {/* CSV Upload */}
        {importSource === 'csv' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
            
            <div className="mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Upload a CSV file with email addresses. First row should contain headers.
              </p>
            </div>

            {csvPreview.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CSV Preview & Mapping</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {csvPreview[0]?.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(1, 4).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Column *
                    </label>
                    <select
                      value={csvMapping.email}
                      onChange={(e) => setCsvMapping({ ...csvMapping, email: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {csvPreview[0]?.map((header, index) => (
                        <option key={index} value={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name Column
                    </label>
                    <select
                      value={csvMapping.firstName}
                      onChange={(e) => setCsvMapping({ ...csvMapping, firstName: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={-1}>None</option>
                      {csvPreview[0]?.map((header, index) => (
                        <option key={index} value={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name Column
                    </label>
                    <select
                      value={csvMapping.lastName}
                      onChange={(e) => setCsvMapping({ ...csvMapping, lastName: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={-1}>None</option>
                      {csvPreview[0]?.map((header, index) => (
                        <option key={index} value={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CRM Data Selection */}
        {importSource !== 'csv' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select {importSource.charAt(0).toUpperCase() + importSource.slice(1)}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedItems.length} of {getImportCount()} selected
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={selectAllItems}
                  disabled={selectedItems.length === getImportCount()}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearSelection}
                  disabled={selectedItems.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
              {/* Contacts */}
              {importSource === 'contacts' && (
                <div className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(contact.id)}
                        onChange={() => toggleItemSelection(contact.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                        {contact.company && (
                          <div className="text-xs text-gray-400">{contact.company.name}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Companies */}
              {importSource === 'companies' && (
                <div className="divide-y divide-gray-200">
                  {companies.map((company) => (
                    <label key={company.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(company.id)}
                        onChange={() => toggleItemSelection(company.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Deals */}
              {importSource === 'deals' && (
                <div className="divide-y divide-gray-200">
                  {deals.map((deal) => (
                    <label key={deal.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(deal.id)}
                        onChange={() => toggleItemSelection(deal.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{deal.name}</div>
                        {deal.contact && (
                          <div className="text-sm text-gray-500">
                            {deal.contact.firstName} {deal.contact.lastName} - {deal.contact.email}
                          </div>
                        )}
                        {deal.company && (
                          <div className="text-sm text-gray-500">
                            {deal.company.name} - {deal.company.email}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href={`/dashboard/email-marketing/lists/${listId}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          
          <Button
            onClick={handleImport}
            disabled={isImporting || (importSource === 'csv' && !csvFile) || (importSource !== 'csv' && selectedItems.length === 0)}
          >
            {isImporting ? 'Importing...' : 'Import Subscribers'}
          </Button>
        </div>
      </div>
    </div>
  );
} 