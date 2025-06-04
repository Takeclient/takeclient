'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
}

interface Company {
  id: string;
  name: string;
}

interface Deal {
  id: string;
  name: string;
  value: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', icon: ArrowDownIcon, color: 'text-gray-600' },
  { value: 'MEDIUM', label: 'Medium', icon: MinusIcon, color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', icon: ArrowUpIcon, color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', icon: ExclamationTriangleIcon, color: 'text-red-600' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function NewTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
    assignedTo: '',
    contactId: '',
    companyId: '',
    dealId: '',
  });

  useEffect(() => {
    loadRelatedData();
  }, []);

  const loadRelatedData = async () => {
    try {
      const [contactsRes, companiesRes, dealsRes, usersRes] = await Promise.all([
        fetch('/api/contacts?limit=100'),
        fetch('/api/companies?limit=100'),
        fetch('/api/deals?limit=100'),
        fetch('/api/users'),
      ]);

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || contactsData);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.companies || companiesData);
      }

      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        setDeals(dealsData.deals || dealsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || usersData);
      }
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
          contactId: formData.contactId || null,
          companyId: formData.companyId || null,
          dealId: formData.dealId || null,
        }),
      });

      if (response.ok) {
        toast.success('Task created successfully');
        router.push('/dashboard/tasks');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === formData.priority);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-7 w-7 text-green-600 mr-3" />
              Create New Task
            </h1>
            <p className="text-gray-600 mt-1">
              Assign a new task to a team member
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what needs to be done..."
              className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITY_OPTIONS.map((priority) => {
                  const IconComponent = priority.icon;
                  return (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                      className={`p-3 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                        formData.priority === priority.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${priority.color}`} />
                      <span className="text-sm font-medium">{priority.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                Assign To *
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Select team member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Related Entities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-2">
                Related Contact
              </label>
              <select
                id="contactId"
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                Related Company
              </label>
              <select
                id="companyId"
                name="companyId"
                value={formData.companyId}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dealId" className="block text-sm font-medium text-gray-700 mb-2">
                Related Deal
              </label>
              <select
                id="dealId"
                name="dealId"
                value={formData.dealId}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
              >
                <option value="">Select a deal</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.name} (${(deal.value / 100).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Preview */}
          {formData.title && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Task Preview</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{formData.title}</span>
                  {selectedPriority && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      formData.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      formData.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      formData.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <selectedPriority.icon className="h-3 w-3 mr-1" />
                      {selectedPriority.label}
                    </span>
                  )}
                </div>
                {formData.description && (
                  <p className="text-sm text-gray-600 ml-6">{formData.description}</p>
                )}
                {formData.dueDate && (
                  <div className="flex items-center space-x-2 ml-6">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Due: {new Date(formData.dueDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {formData.assignedTo && (
                  <div className="flex items-center space-x-2 ml-6">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Assigned to: {users.find(u => u.id === formData.assignedTo)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.assignedTo}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 