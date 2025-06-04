'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { PLAN_CONFIGS, formatPrice } from '@/app/lib/plans';

const plans = [
  {
    ...PLAN_CONFIGS.FREE,
    popular: false,
    href: '/auth/signup?plan=FREE',
    color: 'gray'
  },
  {
    ...PLAN_CONFIGS.NORMAL,
    popular: true,
    href: '/auth/signup?plan=NORMAL',
    color: 'blue'
  },
  {
    ...PLAN_CONFIGS.PREMIUM,
    popular: false,
    href: '/auth/signup?plan=PREMIUM',
    color: 'purple'
  },
  {
    ...PLAN_CONFIGS.ELITE,
    popular: false,
    href: '/auth/signup?plan=ELITE',
    color: 'gold'
  }
];

const features = [
  { name: 'Contacts', key: 'contacts', type: 'limit' },
  { name: 'Forms', key: 'forms', type: 'limit' },
  { name: 'Form Submissions', key: 'submissions', type: 'limit' },
  { name: 'Team Members', key: 'users', type: 'limit' },
  { name: 'Deals', key: 'deals', type: 'limit' },
  { name: 'Companies', key: 'companies', type: 'limit' },
  { name: 'Storage', key: 'storage', type: 'text' },
  { name: 'Support', key: 'support', type: 'text' },
  { name: 'Custom Domain', key: 'customDomain', type: 'boolean' },
  { name: 'API Access', key: 'apiAccess', type: 'boolean' },
  { name: 'Advanced Reports', key: 'advancedReports', type: 'boolean' },
  { name: 'Integrations', key: 'integrations', type: 'text' },
  { name: 'Custom Branding', key: 'customBranding', type: 'boolean' },
  { name: 'Dedicated Manager', key: 'dedicatedManager', type: 'boolean' },
  { name: 'SLA', key: 'sla', type: 'text' },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const formatFeatureValue = (feature: any, plan: any) => {
    const value = plan.features[feature.key];
    
    if (feature.type === 'limit') {
      if (value === -1) return 'Unlimited';
      if (typeof value === 'number') return value.toLocaleString();
      return value || '—';
    }
    
    if (feature.type === 'boolean') {
      return value ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XMarkIcon className="h-5 w-5 text-gray-300" />;
    }
    
    if (feature.type === 'text') {
      return value || '—';
    }
    
    return value || '—';
  };

  const getPrice = (plan: any) => {
    if (plan.price === 0) return 'Free';
    
    const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.price;
    const monthlyPrice = billingInterval === 'yearly' ? price / 12 : price;
    
    return (
      <div className="flex items-baseline">
        <span className="text-4xl font-bold">{formatPrice(monthlyPrice)}</span>
        <span className="text-gray-500 ml-1">/month</span>
        {billingInterval === 'yearly' && (
          <span className="text-sm text-green-600 ml-2 font-medium">
            Save 17%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              CRM Pro
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Choose the perfect plan for your business. Start free and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-16">
              <div className="relative bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('yearly')}
                  className={`relative px-6 py-2 text-sm font-medium rounded-md transition-all ${
                    billingInterval === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-lg ${
                plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.displayName}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  {getPrice(plan)}
                </div>

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Start Free Trial'}
                </Link>

                <div className="mt-8 space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {features.slice(0, 8).map((feature) => (
                      <li key={feature.key} className="flex items-center">
                        <div className="flex-shrink-0 w-5">
                          {formatFeatureValue(feature, plan)}
                        </div>
                        <span className="ml-3 text-sm text-gray-600">
                          {feature.name}
                          {feature.type === 'limit' && plan.features[feature.key] !== -1 && (
                            <span className="font-medium text-gray-900">
                              {typeof plan.features[feature.key] === 'number' 
                                ? `: ${plan.features[feature.key].toLocaleString()}`
                                : plan.features[feature.key] ? `: ${plan.features[feature.key]}` : ''
                              }
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compare all features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our pricing plans
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Features
                </th>
                {plans.map((plan) => (
                  <th key={plan.name} className="text-center py-4 px-6">
                    <div className="font-semibold text-gray-900">
                      {plan.displayName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getPrice(plan)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr 
                  key={feature.key} 
                  className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {feature.name}
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="py-4 px-6 text-center">
                      {formatFeatureValue(feature, plan)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses that trust CRM Pro to manage their customer relationships.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
} 