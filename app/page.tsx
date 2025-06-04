'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckIcon, 
  StarIcon,
  ArrowRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    features: {
      contacts: 100,
      forms: 2,
      submissions: 200,
      users: 1,
      deals: 50,
      companies: 25,
      storage: '100MB',
      support: 'Community'
    },
    limitations: [
      '100 contacts',
      '2 forms',
      '200 submissions/month',
      '1 user',
      'Community support',
      'Basic features only'
    ],
    popular: false,
    cta: 'Get Started',
    color: 'gray'
  },
  {
    name: 'Normal',
    price: 29,
    yearlyPrice: 290,
    description: 'Great for small teams',
    features: {
      contacts: 2000,
      forms: 10,
      submissions: 5000,
      users: 3,
      deals: 500,
      companies: 200,
      storage: '1GB',
      support: 'Email'
    },
    limitations: [
      '2,000 contacts',
      '10 forms',
      '5,000 submissions/month',
      '3 users',
      'Email support',
      'API access',
      'Basic integrations'
    ],
    popular: true,
    cta: 'Start Free Trial',
    color: 'blue'
  },
  {
    name: 'Premium',
    price: 59,
    yearlyPrice: 590,
    description: 'Best for growing businesses',
    features: {
      contacts: 5000,
      forms: 50,
      submissions: 15000,
      users: 10,
      deals: 2000,
      companies: 1000,
      storage: '5GB',
      support: 'Priority Email'
    },
    limitations: [
      '5,000 contacts',
      '50 forms',
      '15,000 submissions/month',
      '10 users',
      'Priority email support',
      'Custom domain',
      'Advanced reports',
      'Advanced integrations',
      'Custom branding'
    ],
    popular: false,
    cta: 'Start Free Trial',
    color: 'purple'
  },
  {
    name: 'Elite',
    price: 119,
    yearlyPrice: 1190,
    description: 'For enterprise organizations',
    features: {
      contacts: 10000,
      forms: 100,
      submissions: 50000,
      users: 25,
      deals: 10000,
      companies: 5000,
      storage: '50GB',
      support: 'Phone & Email'
    },
    limitations: [
      '10,000 contacts',
      '100 forms',
      '50,000 submissions/month',
      '25 users',
      'Phone & email support',
      'Dedicated account manager',
      '99.9% SLA',
      'Custom fields',
      'Enterprise integrations',
      'Priority support'
    ],
    popular: false,
    cta: 'Contact Sales',
    color: 'gold'
  }
];

const features = [
  {
    name: 'Contact Management',
    description: 'Organize and track all your leads and customers in one place.',
    icon: UserGroupIcon,
  },
  {
    name: 'Form Builder',
    description: 'Create beautiful forms to capture leads from your website.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Analytics & Reports',
    description: 'Get insights into your sales pipeline and form performance.',
    icon: ChartBarIcon,
  },
  {
    name: 'Integrations',
    description: 'Connect with your favorite tools and automate workflows.',
    icon: CogIcon,
  }
];

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CRM Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-700 hover:text-gray-900">
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Business with
              <span className="text-blue-600"> Smart CRM</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Manage contacts, create forms, track deals, and convert more leads into customers. 
              Everything you need to grow your business in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="#pricing"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you capture leads, manage relationships, and close more deals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose the plan that's right for your business. Upgrade or downgrade at any time.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save 2 months
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg shadow-lg bg-white p-8 relative ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>

                  <Link
                    href={plan.name === 'Free' ? '/auth/signup' : '/auth/signup'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors inline-block ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                <div className="mt-8">
                  <ul className="space-y-3">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust CRM Pro to manage their customer relationships and drive growth.
          </p>
          <Link 
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">CRM Pro</h3>
            <p className="text-gray-400 mb-6">
              The complete customer relationship management solution for growing businesses.
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400">
                © 2024 CRM Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
