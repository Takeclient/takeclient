'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  plan: {
    id: string;
    displayName: string;
    price: number;
  };
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
  };
  _count: {
    users: number;
    contacts: number;
    companies: number;
    deals: number;
  };
}

export default function TenantManagement() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    loadTenants();
    loadPlans();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterPlan !== 'all') params.append('planId', filterPlan);

      const response = await fetch(`/api/admin/tenants?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants);
      } else {
        toast.error('Failed to load tenants');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast.error('Error loading tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !tenant.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Tenant ${!tenant.isActive ? 'activated' : 'deactivated'} successfully`);
        loadTenants();
      } else {
        toast.error('Failed to update tenant');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error('Error updating tenant');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will delete all associated data and cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Tenant deleted successfully');
        loadTenants();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Error deleting tenant');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = !searchTerm || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || tenant.plan.id === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600">
              Manage all tenants on your platform
            </p>
          </div>
          <Link
            href="/admin/tenants/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Tenant
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && loadTenants()}
                className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => {
                setFilterPlan(e.target.value);
                loadTenants();
              }}
              className="block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Plans</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.displayName}</option>
              ))}
            </select>
            <button
              onClick={loadTenants}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className={!tenant.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tenant.logo ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={tenant.logo}
                          alt={tenant.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.plan.displayName}</div>
                    <div className="text-sm text-gray-500">
                      ${(tenant.plan.price / 100).toFixed(2)}/mo
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {tenant.subscription && (
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(tenant.subscription.status)
                      }`}>
                        {tenant.subscription.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {tenant._count.users}
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {tenant._count.contacts}
                      </div>
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        {tenant._count.deals}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tenant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/tenants/${tenant.id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/tenants/${tenant.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleToggleActive(tenant)}
                        className={tenant.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {tenant.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={tenant._count.users > 0}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTenants.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterPlan !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating a new tenant'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 