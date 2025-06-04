'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, GlobeAltIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/button';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; slug: string; domain?: string; templateId?: string }) => void;
  templateId?: string;
}

interface Domain {
  id: string;
  domain: string;
  type: 'SUBDOMAIN' | 'CUSTOM';
  isVerified: boolean;
  isActive: boolean;
  cname?: string;
}

export default function CreatePageModal({ isOpen, onClose, onConfirm, templateId }: CreatePageModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState<Domain[]>([]);
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDomains();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-generate slug from name
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  }, [name]);

  const fetchDomains = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
        
        // Set default subdomain
        const defaultSubdomain = data.domains.find((d: Domain) => d.type === 'SUBDOMAIN');
        if (defaultSubdomain) {
          setSelectedDomain(defaultSubdomain.domain);
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a page name');
      return;
    }
    
    if (!slug.trim()) {
      toast.error('Please enter a URL slug');
      return;
    }
    
    if (!selectedDomain) {
      toast.error('Please select a domain');
      return;
    }

    onConfirm({
      name: name.trim(),
      slug: slug.trim(),
      domain: useCustomDomain ? selectedDomain : undefined,
      templateId,
    });
  };

  const reset = () => {
    setName('');
    setSlug('');
    setUseCustomDomain(false);
    setSelectedDomain(domains.find(d => d.type === 'SUBDOMAIN')?.domain || '');
  };

  const customDomains = domains.filter(d => d.type === 'CUSTOM' && d.isVerified);
  const subdomainDomain = domains.find(d => d.type === 'SUBDOMAIN');

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Create New Landing Page
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Page Name */}
                      <div>
                        <label htmlFor="page-name" className="block text-sm font-medium text-gray-700">
                          Page Name
                        </label>
                        <input
                          type="text"
                          id="page-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="My Awesome Landing Page"
                          autoFocus
                        />
                      </div>

                      {/* URL Slug */}
                      <div>
                        <label htmlFor="page-slug" className="block text-sm font-medium text-gray-700">
                          URL Slug
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                            https://{selectedDomain}/
                          </span>
                          <input
                            type="text"
                            id="page-slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="my-page"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Full URL: https://{selectedDomain}/{slug || 'my-page'}
                        </p>
                      </div>

                      {/* Domain Selection */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Domain
                        </label>
                        
                        {/* Default Subdomain Option */}
                        {subdomainDomain && (
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="use-subdomain"
                                name="domain-type"
                                type="radio"
                                checked={!useCustomDomain}
                                onChange={() => {
                                  setUseCustomDomain(false);
                                  setSelectedDomain(subdomainDomain.domain);
                                }}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="use-subdomain" className="font-medium text-gray-700">
                                Use default subdomain
                              </label>
                              <p className="text-gray-500">
                                {subdomainDomain.domain}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Custom Domain Option */}
                        {customDomains.length > 0 ? (
                          <>
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="use-custom"
                                  name="domain-type"
                                  type="radio"
                                  checked={useCustomDomain}
                                  onChange={() => setUseCustomDomain(true)}
                                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="use-custom" className="font-medium text-gray-700">
                                  Use custom domain
                                </label>
                                <p className="text-gray-500">
                                  Use one of your verified custom domains
                                </p>
                              </div>
                            </div>

                            {useCustomDomain && (
                              <select
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              >
                                <option value="">Select a domain</option>
                                {customDomains.map(domain => (
                                  <option key={domain.id} value={domain.domain}>
                                    {domain.domain}
                                  </option>
                                ))}
                              </select>
                            )}
                          </>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <GlobeAltIcon className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                  Need a custom domain?
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                  <p>Add and verify your custom domain in the domain management section.</p>
                                  <Link 
                                    href="/dashboard/domains" 
                                    className="font-medium underline hover:no-underline"
                                  >
                                    Manage Domains →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                          type="submit"
                          className="w-full sm:w-auto sm:ml-3"
                          disabled={isLoading}
                        >
                          Create Page
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            reset();
                            onClose();
                          }}
                          className="mt-3 w-full sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 