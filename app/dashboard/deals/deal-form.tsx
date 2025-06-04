'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import toast, { Toaster } from 'react-hot-toast';

type Contact = {
  id: string;
  firstName: string;
  lastName?: string;
};

type Company = {
  id: string;
  name: string;
};

type DealFormProps = {
  initialData?: {
    id?: string;
    name: string;
    value: number;
    stage: string;
    probability: number;
    closeDate: string;
    description: string;
    source?: string;
    tags?: string[];
    companyId: string | null;
    contactId: string | null;
  };
  isEditing?: boolean;
};

export default function DealForm({ 
  initialData,
  isEditing = false
}: DealFormProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      value: 0,
      stage: 'PROSPECTING',
      probability: 10,
      closeDate: '',
      description: '',
      source: '',
      tags: [],
      companyId: null,
      contactId: null,
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsFetching(true);
      
      // Fetch companies and contacts
      const [companiesResponse, contactsResponse] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/contacts')
      ]);
      
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData.companies || []);
      }
      
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Update probability based on stage
  useEffect(() => {
    const stageProbabilities: { [key: string]: number } = {
      'PROSPECTING': 10,
      'QUALIFICATION': 30,
      'PROPOSAL': 50,
      'NEGOTIATION': 70,
      'CLOSED_WON': 100,
      'CLOSED_LOST': 0,
    };
    
    if (formData.stage in stageProbabilities) {
      setFormData(prev => ({
        ...prev,
        probability: stageProbabilities[formData.stage],
      }));
    }
  }, [formData.stage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'probability' ? Number(value) : 
              (name === 'companyId' || name === 'contactId') && value === '' ? null : value,
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }
    
    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than zero';
    }
    
    if (!formData.closeDate && ['PROPOSAL', 'NEGOTIATION'].includes(formData.stage)) {
      newErrors.closeDate = 'Close date is required for this stage';
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
      const url = isEditing ? `/api/deals/${initialData?.id}` : '/api/deals';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Deal updated successfully!' : 'Deal created successfully!');
        router.push('/dashboard/deals');
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
          toast.error(errorData.error || 'Failed to save deal');
        }
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error('Failed to save deal');
    } finally {
      setIsLoading(false);
    }
  };

  const stageOptions = [
    { value: 'PROSPECTING', label: 'Prospecting' },
    { value: 'QUALIFICATION', label: 'Qualification' },
    { value: 'PROPOSAL', label: 'Proposal' },
    { value: 'NEGOTIATION', label: 'Negotiation' },
    { value: 'CLOSED_WON', label: 'Closed Won' },
    { value: 'CLOSED_LOST', label: 'Closed Lost' },
  ];

  const sourceOptions = [
    { value: '', label: 'Select source' },
    { value: 'Website', label: 'Website' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Deal Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the deal or opportunity.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <Input
                    label="Deal name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                    placeholder="e.g., New Software License, Consulting Project"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                    Value ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="value"
                      id="value"
                      min="0"
                      value={formData.value}
                      onChange={handleChange}
                      className={`block w-full pl-7 pr-3 py-2 border ${
                        errors.value ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                    />
                  </div>
                  {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                    Stage
                  </label>
                  <select
                    id="stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {stageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="probability" className="block text-sm font-medium text-gray-700">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    name="probability"
                    id="probability"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-set based on stage, but can be adjusted
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    name="closeDate"
                    id="closeDate"
                    value={formData.closeDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full border ${
                      errors.closeDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  />
                  {errors.closeDate && <p className="mt-1 text-sm text-red-600">{errors.closeDate}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {sourceOptions.map((option) => (
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

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
                    Primary Contact
                  </label>
                  <select
                    id="contactId"
                    name="contactId"
                    value={formData.contactId || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    disabled={isFetching}
                  >
                    <option value="">No Contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName || ''}
                      </option>
                    ))}
                  </select>
                  {isFetching && (
                    <p className="mt-1 text-xs text-gray-500">Loading contacts...</p>
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Describe the opportunity..."
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
            {isLoading ? 'Saving...' : isEditing ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </>
  );
}
