'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';

type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    barcode: '',
    type: 'PHYSICAL' as ProductType,
    status: 'DRAFT',
    price: '',
    compareAtPrice: '',
    cost: '',
    categoryId: '',
    // Digital product fields
    downloadUrl: '',
    downloadLimit: '',
    downloadExpiry: '',
    // Physical product fields
    weight: '',
    length: '',
    width: '',
    height: '',
    requiresShipping: true,
    trackQuantity: true,
    allowBackorder: false,
    initialStock: '0',
    lowStockThreshold: '',
    // Media
    featuredImage: '',
    images: [] as string[],
    // SEO
    metaTitle: '',
    metaDescription: '',
    // Other
    tags: [] as string[],
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/ecommerce/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          length: formData.length ? parseFloat(formData.length) : null,
          width: formData.width ? parseFloat(formData.width) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          downloadLimit: formData.downloadLimit ? parseInt(formData.downloadLimit) : null,
          downloadExpiry: formData.downloadExpiry ? parseInt(formData.downloadExpiry) : null,
          initialStock: parseInt(formData.initialStock),
          lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create product');
      }

      const { product } = await response.json();
      router.push(`/dashboard/ecommerce/products/${product.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const tag = input.value.trim();
      
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        input.value = '';
      }
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/ecommerce/products" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  id="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Product Type *
                </label>
                <select
                  name="type"
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="PHYSICAL">Physical Product</option>
                  <option value="DIGITAL">Digital Product</option>
                  <option value="SERVICE">Service</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                id="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-gray-700">
                  Compare at Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="compareAtPrice"
                    id="compareAtPrice"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                  Cost
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleChange}
                    className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Digital Product Fields */}
          {formData.type === 'DIGITAL' && (
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Digital Product Settings</h2>
              
              <div>
                <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700">
                  Download URL
                </label>
                <input
                  type="url"
                  name="downloadUrl"
                  id="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="downloadLimit" className="block text-sm font-medium text-gray-700">
                    Download Limit (per purchase)
                  </label>
                  <input
                    type="number"
                    name="downloadLimit"
                    id="downloadLimit"
                    min="0"
                    value={formData.downloadLimit}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="downloadExpiry" className="block text-sm font-medium text-gray-700">
                    Download Expiry (days)
                  </label>
                  <input
                    type="number"
                    name="downloadExpiry"
                    id="downloadExpiry"
                    min="0"
                    value={formData.downloadExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Physical Product Fields */}
          {formData.type === 'PHYSICAL' && (
            <>
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresShipping"
                    id="requiresShipping"
                    checked={formData.requiresShipping}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresShipping" className="ml-2 block text-sm text-gray-900">
                    This product requires shipping
                  </label>
                </div>

                {formData.requiresShipping && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                        Weight (g)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        step="0.01"
                        value={formData.weight}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        name="length"
                        id="length"
                        step="0.01"
                        value={formData.length}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="width" className="block text-sm font-medium text-gray-700">
                        Width (cm)
                      </label>
                      <input
                        type="number"
                        name="width"
                        id="width"
                        step="0.01"
                        value={formData.width}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        id="height"
                        step="0.01"
                        value={formData.height}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="trackQuantity"
                      id="trackQuantity"
                      checked={formData.trackQuantity}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="trackQuantity" className="ml-2 block text-sm text-gray-900">
                      Track quantity
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowBackorder"
                      id="allowBackorder"
                      checked={formData.allowBackorder}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowBackorder" className="ml-2 block text-sm text-gray-900">
                      Allow customers to purchase when out of stock
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700">
                        Initial Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="initialStock"
                        id="initialStock"
                        min="0"
                        value={formData.initialStock}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        id="lowStockThreshold"
                        min="0"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (press Enter to add)
              </label>
              <input
                type="text"
                id="tags"
                onKeyDown={handleTagAdd}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Add a tag..."
              />
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                      >
                        <span className="sr-only">Remove tag</span>
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

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <Link href="/dashboard/ecommerce/products">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 