'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  company?: {
    id: string;
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
  value: number;
}

interface QuotationItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export default function EditQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    contactId: '',
    companyId: '',
    dealId: '',
    validUntil: '',
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    terms: '',
    notes: '',
  });

  const [items, setItems] = useState<QuotationItem[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchQuotation();
      fetchData();
    }
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}`);
      
      if (response.ok) {
        const quotation = await response.json();
        
        // Populate form data
        setFormData({
          contactId: quotation.contactId || '',
          companyId: quotation.companyId || '',
          dealId: quotation.dealId || '',
          validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
          billingName: quotation.billingName || '',
          billingEmail: quotation.billingEmail || '',
          billingPhone: quotation.billingPhone || '',
          billingAddress: quotation.billingAddress || '',
          billingCity: quotation.billingCity || '',
          billingState: quotation.billingState || '',
          billingZipCode: quotation.billingZipCode || '',
          billingCountry: quotation.billingCountry || '',
          discountType: quotation.discountType || 'PERCENTAGE',
          discountValue: quotation.discountValue || 0,
          terms: quotation.terms || '',
          notes: quotation.notes || '',
        });
        
        // Populate items
        setItems(quotation.items.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })));
        
      } else if (response.status === 404) {
        toast.error('Quotation not found');
        router.push('/dashboard/quotations');
      } else {
        toast.error('Failed to load quotation');
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to load quotation');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts');
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts);
      }

      // Fetch companies
      const companiesResponse = await fetch('/api/companies');
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData.companies);
      }

      // Fetch deals
      const dealsResponse = await fetch('/api/deals');
      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        setDeals(dealsData.deals);
      }

      // Fetch business settings
      const settingsResponse = await fetch('/api/settings/business');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setBusinessSettings(settingsData.settings);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.billingName) {
      toast.error('Billing name is required');
      return;
    }
    
    if (items.length === 0 || items.every(item => !item.name)) {
      toast.error('At least one item is required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/quotations/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.filter(item => item.name), // Only send items with names
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Quotation updated successfully');
        router.push(`/dashboard/quotations/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: businessSettings?.defaultTaxRate || 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * (item.taxRate / 100));
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (formData.discountType === 'PERCENTAGE') {
      return subtotal * (formData.discountValue / 100);
    }
    return formData.discountValue * 100; // Convert to cents
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  if (isLoadingData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/dashboard/quotations/${params.id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Quotation
        </Link>
        
        <div className="flex items-center">
          <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Quotation</h1>
            <p className="text-sm text-gray-500">Update quotation details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.company && ` - ${contact.company.name}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal
              </label>
              <select
                value={formData.dealId}
                onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a deal</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.name} - {formatCurrency(deal.value * 100)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Name *
              </label>
              <input
                type="text"
                required
                value={formData.billingName}
                onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Email
              </label>
              <input
                type="email"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Phone
              </label>
              <input
                type="tel"
                value={formData.billingPhone}
                onChange={(e) => setFormData({ ...formData, billingPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.billingCity}
                onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                value={formData.billingState}
                onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={formData.billingZipCode}
                onChange={(e) => setFormData({ ...formData, billingZipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.billingCountry}
                onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={addItem}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Product or service name"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice / 100}
                      onChange={(e) => updateItem(index, 'unitPrice', Math.round((parseFloat(e.target.value) || 0) * 100))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate}
                      onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeItem(index)}
                      className="w-full"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Discount</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Payment terms, delivery conditions, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary</h2>
          
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm text-gray-900">{formatCurrency(calculateSubtotal())}</dd>
                </div>
                
                {formData.discountValue > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">
                      Discount ({formData.discountType === 'PERCENTAGE' ? `${formData.discountValue}%` : 'Fixed'})
                    </dt>
                    <dd className="text-sm text-gray-900">-{formatCurrency(calculateDiscount())}</dd>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm text-gray-900">{formatCurrency(calculateTax())}</dd>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">{formatCurrency(calculateTotal())}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Link href={`/dashboard/quotations/${params.id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
} 