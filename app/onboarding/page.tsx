'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate slug from company name
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    setCompanySlug(slug);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyName,
          slug: companySlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Tenant created successfully, redirect to dashboard
      router.push(`/dashboard`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to your CRM
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let&apos;s set up your company
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Let&apos;s get started
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You&apos;re just a few steps away from your new CRM.
                </p>
              </div>
              
              <Button type="submit" fullWidth>
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCreateTenant} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Create your company
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This will be your workspace in the CRM.
                </p>
              </div>

              {error && (
                <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              <Input
                label="Company name"
                value={companyName}
                onChange={handleCompanyNameChange}
                required
                placeholder="Acme Inc."
              />
              
              <Input
                label="Company URL"
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                required
                placeholder="acme"
                className="lowercase"
              />
              
              <p className="text-sm text-gray-500">
                Your company URL will be: <span className="font-medium">{companySlug}.yourcrm.com</span>
              </p>
              
              <Button type="submit" fullWidth disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Company'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
