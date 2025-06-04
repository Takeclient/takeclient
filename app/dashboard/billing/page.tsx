'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CheckIcon,
  ArrowUpIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  features: {
    contacts: number;
    deals: number;
    companies: number;
    users: number;
    storage: string;
    support: string;
    automations: number;
    integrations: number;
  };
  isActive: boolean;
}

interface TenantPlanInfo {
  plan: Plan;
  features: any;
  usage: {
    contacts: number;
    deals: number;
    companies: number;
    users: number;
  };
  limits: {
    contacts: { used: number; limit: number; percentage: number };
    deals: { used: number; limit: number; percentage: number };
    companies: { used: number; limit: number; percentage: number };
    users: { used: number; limit: number; percentage: number };
  };
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [planInfo, setPlanInfo] = useState<TenantPlanInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    loadPlanInfo();
    loadAvailablePlans();
  }, []);

  const loadPlanInfo = async () => {
    try {
      const response = await fetch('/api/billing/current-plan');
      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
      } else {
        toast.error('Failed to load plan information');
      }
    } catch (error) {
      console.error('Error loading plan info:', error);
      toast.error('Error loading plan information');
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data.plans);
      } else {
        toast.error('Failed to load available plans');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error loading plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          interval: isYearly ? 'yearly' : 'monthly',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
        } else {
          toast.success('Plan upgraded successfully!');
          loadPlanInfo();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Error upgrading plan');
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatFeatureValue = (key: string, value: any) => {
    if (value === -1) return 'Unlimited';
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
          <p className="text-gray-600">
            Manage your subscription and view usage statistics
          </p>
        </div>

        {/* Current Plan Overview */}
        {planInfo && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
                <p className="text-sm text-gray-600">Your active subscription details</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {planInfo.plan.displayName}
                </div>
                <div className="text-sm text-gray-600">
                  {formatPrice(planInfo.plan.price)}/month
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Contacts</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {planInfo.limits.contacts.used}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {planInfo.limits.contacts.limit === -1 ? '∞' : planInfo.limits.contacts.limit}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUsageColor(planInfo.limits.contacts.percentage)}`}
                        style={{ width: `${Math.min(planInfo.limits.contacts.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {planInfo.limits.contacts.percentage}% used
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Companies</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {planInfo.limits.companies.used}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {planInfo.limits.companies.limit === -1 ? '∞' : planInfo.limits.companies.limit}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUsageColor(planInfo.limits.companies.percentage)}`}
                        style={{ width: `${Math.min(planInfo.limits.companies.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {planInfo.limits.companies.percentage}% used
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Deals</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {planInfo.limits.deals.used}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {planInfo.limits.deals.limit === -1 ? '∞' : planInfo.limits.deals.limit}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUsageColor(planInfo.limits.deals.percentage)}`}
                        style={{ width: `${Math.min(planInfo.limits.deals.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {planInfo.limits.deals.percentage}% used
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-orange-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">Users</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        {planInfo.limits.users.used}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {planInfo.limits.users.limit === -1 ? '∞' : planInfo.limits.users.limit}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getUsageColor(planInfo.limits.users.percentage)}`}
                        style={{ width: `${Math.min(planInfo.limits.users.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {planInfo.limits.users.percentage}% used
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
              <p className="text-sm text-gray-600">Choose the plan that fits your needs</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${!isYearly ? 'font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="text-xs text-green-600 font-medium">Save 20%</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availablePlans.map((plan) => {
              const isCurrentPlan = planInfo?.plan.id === plan.id;
              const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-6 ${
                    isCurrentPlan
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                      Current
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.displayName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-600">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}: {formatFeatureValue(key, value)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-500 bg-gray-100 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        <ArrowUpIcon className="h-4 w-4 mr-2" />
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
              <p className="text-sm text-gray-600">Manage your billing information</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 