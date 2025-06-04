'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { PLAN_CONFIGS, formatPrice } from '@/app/lib/plans';
import toast, { Toaster } from 'react-hot-toast';

const plans = Object.values(PLAN_CONFIGS);

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanParam = searchParams.get('plan') || 'FREE';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    selectedPlan: selectedPlanParam,
    billingInterval: 'monthly' as 'monthly' | 'yearly'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: User Info, 2: Plan Selection, 3: Payment (if needed)

  useEffect(() => {
    if (selectedPlanParam && selectedPlanParam !== formData.selectedPlan) {
      setFormData(prev => ({ ...prev, selectedPlan: selectedPlanParam }));
    }
  }, [selectedPlanParam]);

  const selectedPlan = PLAN_CONFIGS[formData.selectedPlan as keyof typeof PLAN_CONFIGS];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create tenant and user account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          planName: formData.selectedPlan,
          billingInterval: formData.billingInterval
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // If it's a paid plan, redirect to Stripe Checkout
      if (selectedPlan.price > 0) {
        // Create Stripe checkout session
        const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: signupData.tenantId,
            planName: formData.selectedPlan,
            billingInterval: formData.billingInterval,
            email: formData.email
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (!checkoutResponse.ok) {
          throw new Error(checkoutData.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        window.location.href = checkoutData.url;
      } else {
        // Free plan - redirect to dashboard
        toast.success('Account created successfully!');
        router.push('/auth/signin?message=Account created successfully. Please sign in.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const getPrice = (plan: any) => {
    if (plan.price === 0) return 'Free';
    
    const price = formData.billingInterval === 'yearly' ? plan.yearlyPrice : plan.price;
    const monthlyPrice = formData.billingInterval === 'yearly' ? price / 12 : price;
    
    return formatPrice(monthlyPrice);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-gray-900">
            CRM Pro
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Selected Plan Display */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Selected Plan</h3>
            <Link 
              href="/pricing" 
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Change plan
            </Link>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{selectedPlan.displayName}</h4>
              <p className="text-sm text-gray-600">{selectedPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {getPrice(selectedPlan)}
                {selectedPlan.price > 0 && (
                  <span className="text-sm font-normal text-gray-500">/month</span>
                )}
              </div>
              {formData.billingInterval === 'yearly' && selectedPlan.price > 0 && (
                <div className="text-sm text-green-600 font-medium">Save 17%</div>
              )}
            </div>
          </div>

          {selectedPlan.price > 0 && (
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, billingInterval: 'monthly' }))}
                className={`flex-1 py-2 px-3 text-sm rounded-md ${
                  formData.billingInterval === 'monthly'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, billingInterval: 'yearly' }))}
                className={`flex-1 py-2 px-3 text-sm rounded-md ${
                  formData.billingInterval === 'yearly'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Yearly (Save 17%)
              </button>
            </div>
          )}
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6 bg-white rounded-lg p-8 shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : selectedPlan.price === 0 ? (
                'Create Free Account'
              ) : (
                `Start ${formData.billingInterval === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>

          {selectedPlan.price > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Free Trial:</strong> Start with a 14-day free trial. No charges until your trial ends.
                    Cancel anytime during your trial.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
