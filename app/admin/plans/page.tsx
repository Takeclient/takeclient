'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
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
    forms: number;
    storage: string;
    support: string;
    automations: number;
    integrations: number;
  };
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  _count?: {
    tenants: number;
  };
}

export default function PlanManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Check if user is super admin
  const user = session?.user as any;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' && user?.isSuperAdmin === true;

  useEffect(() => {
    if (status === 'authenticated' && isSuperAdmin) {
    loadPlans();
    } else if (status === 'authenticated' && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [status, isSuperAdmin, router]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load plans');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error loading plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Plan deleted successfully');
        loadPlans();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Error deleting plan');
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const response = await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !plan.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
        loadPlans();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Error updating plan');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
            <p className="text-gray-600">
              Create and manage subscription plans for your platform
            </p>
          </div>
          <button
            onClick={handleCreatePlan}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border ${
                plan.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-200 bg-gray-50'
              } p-6`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleToggleActive(plan)}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    plan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? (
                    <CheckIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <XMarkIcon className="h-3 w-3 mr-1" />
                  )}
                  {plan.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Plan Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.displayName}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-600">/month</span>
                  {plan.yearlyPrice && (
                    <div className="text-sm text-gray-500">
                      {formatPrice(plan.yearlyPrice)}/year
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                <div className="text-sm">
                  <strong>Features:</strong>
                </div>
                {Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium">{formatFeatureValue(key, value)}</span>
                  </div>
                ))}
                {plan._count && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span>Current Subscribers:</span>
                    <span className="font-medium">{plan._count.tenants}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                  disabled={!!(plan._count?.tenants && plan._count.tenants > 0)}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No plans found</h3>
            <p className="text-gray-500 mt-2">Create your first subscription plan to get started.</p>
            <button
              onClick={handleCreatePlan}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Plan
            </button>
          </div>
        )}
      </div>

      {/* Plan Form Modal would go here */}
      {showForm && (
        <PlanFormModal
          plan={editingPlan}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadPlans();
          }}
        />
      )}
    </>
  );
}

// Plan Form Modal Component
interface PlanFormModalProps {
  plan?: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
}

function PlanFormModal({ plan, onClose, onSuccess }: PlanFormModalProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    displayName: plan?.displayName || '',
    description: plan?.description || '',
    price: plan?.price ? plan.price / 100 : 0,
    yearlyPrice: plan?.yearlyPrice ? plan.yearlyPrice / 100 : 0,
    features: plan?.features || {
      contacts: 100,
      deals: 50,
      companies: 25,
      users: 1,
      forms: 3,
      storage: '1GB',
      support: 'Email',
      automations: 0,
      integrations: 1,
    },
    isActive: plan?.isActive ?? true,
    sortOrder: plan?.sortOrder || 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = plan ? `/api/admin/plans/${plan.id}` : '/api/admin/plans';
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Math.round(formData.price * 100), // Convert to cents
          yearlyPrice: formData.yearlyPrice ? Math.round(formData.yearlyPrice * 100) : undefined,
        }),
      });

      if (response.ok) {
        toast.success(`Plan ${plan ? 'updated' : 'created'} successfully`);
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${plan ? 'update' : 'create'} plan`);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Error saving plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (ID)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="FREE, PREMIUM, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Free, Premium, etc."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={2}
                placeholder="Plan description..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yearly Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Feature Limits */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Feature Limits</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contacts</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.contacts}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, contacts: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deals</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.deals}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, deals: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Companies</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.companies}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, companies: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Users</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.users}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, users: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forms</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.forms}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, forms: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Storage</label>
                  <input
                    type="text"
                    value={formData.features.storage}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, storage: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="1GB, 10GB, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Support</label>
                  <input
                    type="text"
                    value={formData.features.support}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, support: e.target.value }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Email, Chat, Phone, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Automations</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.automations}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, automations: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Integrations</label>
                  <input
                    type="number"
                    min="-1"
                    value={formData.features.integrations}
                    onChange={(e) => setFormData({
                      ...formData,
                      features: { ...formData.features, integrations: parseInt(e.target.value) || 0 }
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active</label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 