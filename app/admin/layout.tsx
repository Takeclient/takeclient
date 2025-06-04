'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Plans', href: '/admin/plans', icon: CreditCardIcon },
  { name: 'Tenants', href: '/admin/tenants', icon: BuildingOfficeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CurrencyDollarIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon },
  { name: 'System Config', href: '/admin/system-config', icon: CogIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is super admin
  interface ExtendedUser {
    role?: string;
    isSuperAdmin?: boolean;
    name?: string;
    email?: string;
  }
  
  const user = session?.user as ExtendedUser;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' && user?.isSuperAdmin === true;

  // Handle navigation in useEffect to avoid rendering issues
  useEffect(() => {
    if (status === 'authenticated' && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [status, isSuperAdmin, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If user is not authenticated or not a super admin, show loading while redirecting
  if (!session || !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
                <h2 className="text-xl font-bold flex items-center">
                  <ShieldCheckIcon className="h-8 w-8 mr-2 text-red-500" />
                  Super Admin
                </h2>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronDownIcon
                  className={`h-6 w-6 transform transition-transform ${
                    sidebarOpen ? 'rotate-90' : '-rotate-90'
                  }`}
                />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                  <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Platform Administration
              </h1>
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                </button>

                {/* Quick Actions */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Back to CRM
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 