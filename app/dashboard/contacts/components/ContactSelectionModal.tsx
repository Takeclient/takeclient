'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status: string;
  avatar?: string;
  jobTitle?: string;
  company?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ContactSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactsSelected: (contactIds: string[]) => void;
  stageId: string;
  stageName: string;
  excludeContactIds?: string[];
}

export default function ContactSelectionModal({
  isOpen,
  onClose,
  onContactsSelected,
  stageId,
  stageName,
  excludeContactIds = [],
}: ContactSelectionModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setSelectedContactIds([]);
      setSearchTerm('');
      setStatusFilter('ALL');
    }
  }, [isOpen]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter, excludeContactIds]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contacts?limit=1000'); // Get all contacts
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        toast.error('Failed to load contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error loading contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts.filter(contact => !excludeContactIds.includes(contact.id));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName || ''}`.toLowerCase().includes(term) ||
        contact.email?.toLowerCase().includes(term) ||
        contact.company?.name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredContacts.map(contact => contact.id);
    setSelectedContactIds(
      selectedContactIds.length === allIds.length ? [] : allIds
    );
  };

  const handleConfirm = () => {
    onContactsSelected(selectedContactIds);
    onClose();
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add Contacts to {stageName}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Select contacts to add to this stage
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Filters */}
                <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      {selectedContactIds.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedContactIds.length} of {filteredContacts.length} contacts selected
                    </span>
                  </div>
                </div>

                {/* Contact List */}
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No contacts found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredContacts.map((contact) => {
                        const isSelected = selectedContactIds.includes(contact.id);
                        return (
                          <div
                            key={contact.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-red-50 border-l-4 border-red-500' : ''
                            }`}
                            onClick={() => handleContactToggle(contact.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    {contact.avatar ? (
                                      <img
                                        src={contact.avatar}
                                        alt={contact.firstName}
                                        className="w-10 h-10 rounded-full"
                                      />
                                    ) : (
                                      <UserIcon className="h-6 w-6 text-gray-600" />
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                      <CheckIcon className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {contact.firstName} {contact.lastName || ''}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(contact.status)}`}>
                                      {contact.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1">
                                    {contact.email && (
                                      <div className="flex items-center text-xs text-gray-500">
                                        <EnvelopeIcon className="h-3 w-3 mr-1" />
                                        {contact.email}
                                      </div>
                                    )}
                                    {contact.phone && (
                                      <div className="flex items-center text-xs text-gray-500">
                                        <PhoneIcon className="h-3 w-3 mr-1" />
                                        {contact.phone}
                                      </div>
                                    )}
                                    {contact.company && (
                                      <div className="flex items-center text-xs text-gray-500">
                                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                        {contact.company.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={selectedContactIds.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add {selectedContactIds.length} Contact{selectedContactIds.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 