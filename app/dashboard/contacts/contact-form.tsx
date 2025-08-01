'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  TagIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Contact Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Basic information about the contact.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <Input
                      label="First Name"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      error={errors.firstName}
                      icon={<UserIcon />}
                      placeholder="Enter first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Input
                      label="Last Name"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      error={errors.lastName}
                      icon={<UserIcon />}
                      placeholder="Enter last name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Input
                      label="Email Address"
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon={<EnvelopeIcon />}
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Input
                      label="Phone Number"
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      icon={<PhoneIcon />}
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <Input
                      label="Job Title"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      icon={<BriefcaseIcon />}
                      placeholder="Enter job title"
                    />
                  </div>

                  {/* Lead Score */}
                  <div>
                    <Input
                      label="Lead Score (0-100)"
                      id="leadScore"
                      name="leadScore"
                      type="number"
                      min="0"
                      max="100"
                      value={(formData.leadScore || 0).toString()}
                      onChange={handleChange}
                      icon={<ChartBarIcon />}
                      placeholder="Enter lead score"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <Select
                      label="Status"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={statusOptions}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <Select
                      label="Company"
                      id="companyId"
                      name="companyId"
                      value={formData.companyId || ''}
                      onChange={handleChange}
                      disabled={isFetching}
                      icon={<BuildingOfficeIcon />}
                    >
                      <option value="">No Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </Select>
                    {isFetching && (
                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading companies...
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags - Full Width */}
                <div className="mt-6">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TagIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Type a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagAdd}
                        className="flex h-12 w-full rounded-lg border-2 border-gray-200 bg-white pl-10 pr-4 py-3 text-base placeholder:text-gray-400 transition-all duration-200 ease-in-out hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                    </div>
                    {(formData.tags || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(formData.tags || []).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 h-5 w-5 rounded-full flex items-center justify-center hover:bg-red-300 transition-colors"
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes - Full Width */}
                <div className="mt-6">
                  <Textarea
                    label="Notes"
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional notes about this contact..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-6 sm:px-8 flex justify-end space-x-4 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-6 py-3 text-base font-medium"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-3 text-base font-medium bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              isEditing ? 'Update Contact' : 'Create Contact'
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
