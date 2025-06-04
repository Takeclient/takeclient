'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  GlobeAltIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';

interface Domain {
  id: string;
  domain: string;
  type: 'SUBDOMAIN' | 'CUSTOM';
  isVerified: boolean;
  isActive: boolean;
  cname?: string;
  txtRecord?: string;
  verifiedAt?: string;
  createdAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationInstructions, setVerificationInstructions] = useState<any>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
      } else {
        toast.error('Failed to load domains');
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: newDomain.trim(),
          type: 'CUSTOM',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(prev => [data.domain, ...prev]);
        setNewDomain('');
        setShowAddModal(false);
        toast.success('Domain added successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add domain');
      }
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Failed to add domain');
    } finally {
      setIsAdding(false);
    }
  };

  const handleGenerateVerification = async (domain: Domain) => {
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/domains/${domain.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationInstructions(data.instructions);
        setSelectedDomain(data.domain);
        setShowVerifyModal(true);
        toast.success('Verification record generated');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate verification');
      }
    } catch (error) {
      console.error('Error generating verification:', error);
      toast.error('Failed to generate verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyDomain = async (domain: Domain) => {
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/domains/${domain.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(prev => prev.map(d => d.id === domain.id ? data.domain : d));
        setShowVerifyModal(false);
        setSelectedDomain(null);
        setVerificationInstructions(null);
        toast.success('Domain verified successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Domain verification failed');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Failed to verify domain');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteDomain = async (domain: Domain) => {
    if (!confirm(`Are you sure you want to delete ${domain.domain}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/domains/${domain.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== domain.id));
        toast.success('Domain deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete domain');
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Failed to delete domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusIcon = (domain: Domain) => {
    if (domain.type === 'SUBDOMAIN') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    if (domain.isVerified) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = (domain: Domain) => {
    if (domain.type === 'SUBDOMAIN') {
      return 'Active';
    }
    if (domain.isVerified) {
      return 'Verified';
    }
    return 'Pending Verification';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
            <p className="text-gray-600">Manage custom domains for your landing pages</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddModal(true)}
          className="shadow-sm"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Domain
        </Button>
      </div>

      {/* Domains List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center">
            <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No domains</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first custom domain.</p>
            <div className="mt-6">
              <Button onClick={() => setShowAddModal(true)}>
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                Add Domain
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {domains.map((domain) => (
              <div key={domain.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(domain)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{domain.domain}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          domain.type === 'SUBDOMAIN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {domain.type === 'SUBDOMAIN' ? 'Subdomain' : 'Custom Domain'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Status: {getStatusText(domain)}
                        {domain.verifiedAt && (
                          <span className="ml-2">
                            • Verified {new Date(domain.verifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      {domain.cname && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>CNAME:</strong> {domain.cname}
                            <button
                              onClick={() => copyToClipboard(domain.cname!)}
                              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              title="Copy CNAME"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {domain.type === 'CUSTOM' && !domain.isVerified && (
                      <Button
                        variant="secondary"
                        onClick={() => handleGenerateVerification(domain)}
                        disabled={isVerifying}
                        className="text-sm"
                      >
                        {isVerifying ? 'Generating...' : 'Verify'}
                      </Button>
                    )}
                    
                    {domain.type === 'CUSTOM' && (
                      <button
                        onClick={() => handleDeleteDomain(domain)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete domain"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Custom Domain</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    id="domain"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="example.com"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Domain Setup Required
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>After adding your domain, you'll need to:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Add a CNAME record pointing to our servers</li>
                          <li>Add a TXT record for verification</li>
                          <li>Verify domain ownership</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDomain}
                  disabled={isAdding || !newDomain.trim()}
                >
                  {isAdding ? 'Adding...' : 'Add Domain'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && selectedDomain && verificationInstructions && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Domain Verification</h3>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedDomain(null);
                    setVerificationInstructions(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Step 1: Add CNAME Record</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <span className="text-sm text-gray-900">CNAME</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">@</span>
                          <button
                            onClick={() => copyToClipboard('@')}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Value:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{selectedDomain.cname}</span>
                          <button
                            onClick={() => copyToClipboard(selectedDomain.cname!)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Step 2: Add TXT Record for Verification</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Type:</span>
                        <span className="text-sm text-gray-900">{verificationInstructions.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{verificationInstructions.name}</span>
                          <button
                            onClick={() => copyToClipboard(verificationInstructions.name)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Value:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{verificationInstructions.value}</span>
                          <button
                            onClick={() => copyToClipboard(verificationInstructions.value)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important Notes
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>DNS changes can take up to 24-48 hours to propagate</li>
                          <li>Make sure both CNAME and TXT records are properly configured</li>
                          <li>You can verify the domain once the records are active</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedDomain(null);
                    setVerificationInstructions(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleVerifyDomain(selectedDomain)}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Domain'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 