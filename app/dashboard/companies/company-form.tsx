'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import toast, { Toaster } from 'react-hot-toast';

type CompanyFormProps = {
  initialData?: {
    id?: string;
    name: string;
    industry: string;
    website: string;
    address: string;
    size: string;
    phone?: string;
    email?: string;
    revenue?: number;
    description?: string;
    tags?: string[];
  };
  isEditing?: boolean;
};

export default function CompanyForm({ 
  initialData,
  isEditing = false
}: CompanyFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      industry: '',
      website: '',
      address: '',
      size: '',
      phone: '',
      email: '',
      revenue: 0,
      description: '',
      tags: [],
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'revenue' ? parseFloat(value) || 0 : value,
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
      newErrors.name = 'Company name is required';
    }
    
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must start with http:// or https://';
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
      const url = isEditing ? `/api/companies/${initialData?.id}` : '/api/companies';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(isEditing ? 'Company updated successfully!' : 'Company created successfully!');
        router.push('/dashboard/companies');
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
          toast.error(errorData.error || 'Failed to save company');
        }
      }
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeOptions = [
    { value: '', label: 'Select company size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1001+', label: '1001+ employees' },
  ];

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Company Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the company.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <Input
                    label="Company name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Industry"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Finance, Healthcare"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                    Company size
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Phone"
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />
                </div>

                <div className="col-span-6">
                  <Input
                    label="Website"
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    error={errors.website}
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="revenue" className="block text-sm font-medium text-gray-700">
                    Annual Revenue ($)
                  </label>
                  <input
                    type="number"
                    id="revenue"
                    name="revenue"
                    min="0"
                    step="1000"
                    value={(formData.revenue || 0).toString()}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Company address"
                  />
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
                    placeholder="Brief description of the company"
                  />
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
            {isLoading ? 'Saving...' : isEditing ? 'Update Company' : 'Create Company'}
          </Button>
        </div>
      </form>
    </>
  );
}
