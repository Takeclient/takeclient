'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewQuotationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    contactId: '',
    companyId: '',
    dealId: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
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

  const [items, setItems] = useState<QuotationItem[]>([
    {
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
    },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-fill billing info when contact or company changes
    if (formData.contactId) {
      const contact = contacts.find(c => c.id === formData.contactId);
      if (contact) {
        setFormData(prev => ({
          ...prev,
          billingName: `${contact.firstName} ${contact.lastName || ''}`.trim(),
          billingEmail: contact.email || prev.billingEmail,
        }));
      }
    }
    
    if (formData.companyId) {
      const company = companies.find(c => c.id === formData.companyId);
      if (company) {
        setFormData(prev => ({
          ...prev,
          billingName: prev.billingName || company.name,
          billingEmail: prev.billingEmail || company.email || '',
        }));
      }
    }
  }, [formData.contactId, formData.companyId, contacts, companies]);

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
        
        // Set default terms if available
        if (settingsData.settings?.defaultQuotationTerms) {
          setFormData(prev => ({
            ...prev,
            terms: settingsData.settings.defaultQuotationTerms,
          }));
        }
        
        // Set default tax rate for items
        if (settingsData.settings?.defaultTaxRate) {
          setItems(prev => prev.map(item => ({
            ...item,
            taxRate: settingsData.settings.defaultTaxRate,
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessSettings) {
      toast.error('Please set up your business settings first');
      router.push('/dashboard/settings/business');
      return;
    }
    
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
      
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.filter(item => item.name), // Only send items with names
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Quotation created successfully');
        router.push(`/dashboard/quotations/${data.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create quotation');
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error('Failed to create quotation');
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/quotations"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Quotations
        </Link>
        
        <div className="flex items-center">
          <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Quotation</h1>
            <p className="text-sm text-gray-500">Create a new quotation for your customer</p>
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
                      min="0.01"
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
                  
                  <div className="md:col-span-2 flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <p className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}
                      </p>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="ml-2 p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional item description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals and Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Additional Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">%</option>
                    <option value="FIXED">$</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={4}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter terms and conditions..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes for the customer..."
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(calculateTax())}</span>
              </div>
              
              {formData.discountValue > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount
                    {formData.discountType === 'PERCENTAGE' && ` (${formData.discountValue}%)`}
                  </span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(calculateDiscount())}
                  </span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Quotation'}
              </Button>
              
              <Link href="/dashboard/quotations">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 