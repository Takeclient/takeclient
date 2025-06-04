'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import toast, { Toaster } from 'react-hot-toast';

type Company = {
  id: string;
  name: string;
};

type ContactFormProps = {
  initialData?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    companyId: string | null;
    notes: string;
    jobTitle?: string;
    leadScore?: number;
    tags?: string[];
  };
  isEditing?: boolean;
};

export default function ContactForm({ 
  initialData,
  isEditing = false
}: ContactFormProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState(
    initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'LEAD',
      companyId: null,
      notes: '',
      jobTitle: '',
      leadScore: 0,
      tags: [],
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'companyId' && value === '' ? null : 
              name === 'leadScore' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !(formData.tags || []).includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const url = isEditing ? `/api/contacts/${initialData?.id}` : '/api/contacts';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Contact updated successfully!' : 'Contact created successfully!');
        router.push('/dashboard/contacts');
        router.refresh();
      } else {
        const errorData = await response.json();
        
        // Handle plan limit errors specially
        if (response.status === 402 && errorData.planLimit) {
          toast.error(
            <div>
              <p className="font-medium">Plan Limit Reached</p>
              <p className="text-sm mt-1">{errorData.error}</p>
              <button
                onClick={() => router.push('/dashboard/billing')}
                className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Upgrade Plan
              </button>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(errorData.error || 'Failed to save contact');
        }
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'LEAD', label: 'Lead' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'OPPORTUNITY', label: 'Opportunity' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'LOST', label: 'Lost' },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Contact Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the contact.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="First name"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    error={errors.firstName}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Last name"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    error={errors.lastName}
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <Input
                    label="Email address"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Phone number"
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Job Title"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="leadScore" className="block text-sm font-medium text-gray-700">
                    Lead Score (0-100)
                  </label>
                  <input
                    type="number"
                    id="leadScore"
                    name="leadScore"
                    min="0"
                    max="100"
                    value={(formData.leadScore || 0).toString()}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    disabled={isFetching}
                  >
                    <option value="">No Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  {isFetching && (
                    <p className="mt-1 text-xs text-gray-500">Loading companies...</p>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagAdd}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  {(formData.tags || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(formData.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-red-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </>
  );
}
