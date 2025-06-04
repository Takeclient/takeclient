'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
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

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Call', icon: PhoneIcon },
  { value: 'EMAIL', label: 'Email', icon: EnvelopeIcon },
  { value: 'MEETING', label: 'Meeting', icon: UserGroupIcon },
  { value: 'TASK', label: 'Task', icon: CheckCircleIcon },
  { value: 'NOTE', label: 'Note', icon: DocumentTextIcon },
  { value: 'SMS', label: 'SMS', icon: PhoneIcon },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn Message', icon: EnvelopeIcon },
  { value: 'DEMO', label: 'Demo', icon: UserGroupIcon },
  { value: 'FOLLOW_UP', label: 'Follow Up', icon: ClockIcon },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', icon: DocumentTextIcon },
  { value: 'CONTRACT_SENT', label: 'Contract Sent', icon: DocumentTextIcon },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received', icon: CheckCircleIcon },
];

export default function NewActivityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    duration: '',
    scheduledAt: '',
    contactId: '',
    companyId: '',
    dealId: '',
  });

  useEffect(() => {
    loadRelatedData();
  }, []);

  const loadRelatedData = async () => {
    try {
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        fetch('/api/contacts?limit=100'),
        fetch('/api/companies?limit=100'),
        fetch('/api/deals?limit=100'),
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
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          scheduledAt: formData.scheduledAt || null,
          contactId: formData.contactId || null,
          companyId: formData.companyId || null,
          dealId: formData.dealId || null,
        }),
      });

      if (response.ok) {
        toast.success('Activity created successfully');
        router.push('/dashboard/activities');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedType = ACTIVITY_TYPES.find(type => type.value === formData.type);

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
              <CalendarIcon className="h-7 w-7 text-blue-600 mr-3" />
              Create New Activity
            </h1>
            <p className="text-gray-600 mt-1">
              Record a new customer interaction or schedule a future activity
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ACTIVITY_TYPES.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-2 ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={selectedType ? `${selectedType.label} with...` : 'Enter activity title'}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              placeholder="Add notes about this activity..."
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Duration and Scheduled Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                placeholder="30"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              disabled={isLoading || !formData.type || !formData.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}