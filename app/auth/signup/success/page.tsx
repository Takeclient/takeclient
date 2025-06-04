'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SubscriptionDetails {
  planName: string;
  interval: string;
  trialEnd?: string;
  status: string;
}

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  
  const [currentPlan, setCurrentPlan] = useState<Record<string, unknown> | null>(null);

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!plan) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setSubscriptionDetails(data);
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [plan]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't verify your subscription. Please contact support.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try signing in
            </Link>
            <Link
              href="/pricing"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-20 w-20 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to CRM Pro!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription has been successfully activated.
          </p>
        </div>

        {subscriptionDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="text-sm text-gray-900">{subscriptionDetails.planName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Billing</dt>
                  <dd className="text-sm text-gray-900 capitalize">{subscriptionDetails.interval}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Trial ends</dt>
                  <dd className="text-sm text-gray-900">
                    {subscriptionDetails.trialEnd 
                      ? new Date(subscriptionDetails.trialEnd).toLocaleDateString()
                      : 'No trial'
                    }
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                What's next?
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sign in to your account to access the dashboard</li>
                  <li>Set up your team and invite members</li>
                  <li>Start importing your contacts and data</li>
                  <li>Create your first forms and campaigns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in to your account
          </Link>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help getting started?{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 