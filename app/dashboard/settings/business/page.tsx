'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PhotoIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface BusinessSettings {
  id?: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  businessCountry: string;
  taxId: string;
  vatNumber: string;
  defaultTaxRate: number;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankSwiftCode: string;
  bankIban: string;
  invoicePrefix: string;
  quotationPrefix: string;
  proformaPrefix: string;
  defaultPaymentTerms: string;
  defaultQuotationTerms: string;
  logoUrl: string;
}

export default function BusinessSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessWebsite: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessCountry: '',
    taxId: '',
    vatNumber: '',
    defaultTaxRate: 0,
    bankName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankSwiftCode: '',
    bankIban: '',
    invoicePrefix: 'INV-',
    quotationPrefix: 'QUO-',
    proformaPrefix: 'PRO-',
    defaultPaymentTerms: 'Payment is due within 30 days of invoice date.',
    defaultQuotationTerms: 'This quotation is valid for 30 days from the issue date.',
    logoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/business');
      
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } else if (response.status !== 404) {
        toast.error('Failed to load business settings');
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
      toast.error('Failed to load business settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/settings/business', {
        method: settings.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('Business settings saved successfully');
      } else {
        toast.error('Failed to save business settings');
      }
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast.error('Failed to save business settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would implement actual file upload to your storage service
    // For now, we'll just show a message
    toast.success('Logo upload functionality will be implemented with file storage');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your business information and document settings
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', name: 'General Information', icon: BuildingOfficeIcon },
            { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
            { id: 'banking', name: 'Banking', icon: BanknotesIcon },
            { id: 'branding', name: 'Branding', icon: PhotoIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Information */}
        {activeTab === 'general' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">General Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={settings.businessPhone}
                  onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={settings.businessWebsite}
                  onChange={(e) => setSettings({ ...settings, businessWebsite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                value={settings.businessAddress}
                onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
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
                  value={settings.businessCity}
                  onChange={(e) => setSettings({ ...settings, businessCity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={settings.businessState}
                  onChange={(e) => setSettings({ ...settings, businessState: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={settings.businessZipCode}
                  onChange={(e) => setSettings({ ...settings, businessZipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={settings.businessCountry}
                  onChange={(e) => setSettings({ ...settings, businessCountry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={settings.taxId}
                  onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Number
                </label>
                <input
                  type="text"
                  value={settings.vatNumber}
                  onChange={(e) => setSettings({ ...settings, vatNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Documents Settings */}
        {activeTab === 'documents' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Document Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">e.g., INV-</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation Prefix
                </label>
                <input
                  type="text"
                  value={settings.quotationPrefix}
                  onChange={(e) => setSettings({ ...settings, quotationPrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">e.g., QUO-</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proforma Prefix
                </label>
                <input
                  type="text"
                  value={settings.proformaPrefix}
                  onChange={(e) => setSettings({ ...settings, proformaPrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">e.g., PRO-</p>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Payment Terms
              </label>
              <textarea
                rows={3}
                value={settings.defaultPaymentTerms}
                onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter default payment terms that will appear on invoices..."
              />
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Quotation Terms
              </label>
              <textarea
                rows={3}
                value={settings.defaultQuotationTerms}
                onChange={(e) => setSettings({ ...settings, defaultQuotationTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter default terms that will appear on quotations..."
              />
            </div>
          </div>
        )}

        {/* Banking Information */}
        {activeTab === 'banking' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Banking Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={settings.bankAccountNumber}
                  onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={settings.bankRoutingNumber}
                  onChange={(e) => setSettings({ ...settings, bankRoutingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code
                </label>
                <input
                  type="text"
                  value={settings.bankSwiftCode}
                  onChange={(e) => setSettings({ ...settings, bankSwiftCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={settings.bankIban}
                  onChange={(e) => setSettings({ ...settings, bankIban: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding */}
        {activeTab === 'branding' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Branding</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Logo
              </label>
              
              {settings.logoUrl ? (
                <div className="mb-4">
                  <img
                    src={settings.logoUrl}
                    alt="Business Logo"
                    className="h-24 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: '' })}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Logo
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
              
              <p className="mt-2 text-sm text-gray-500">
                This logo will appear on all your quotations, invoices, and other documents.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 