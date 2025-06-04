'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/app/components/dashboard/sidebar';
import { Header } from '@/app/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  
  // Check if user is authenticated
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Check if user needs to create a tenant (but not for super admin users)
  const user = session?.user as any;
  if (status === 'authenticated' && !user?.tenantId && user?.role !== 'SUPER_ADMIN' && !user?.isSuperAdmin) {
    redirect('/onboarding');
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar tenantName={user?.isSuperAdmin ? 'Super Admin' : (user?.tenantSlug || 'Your Company')} />
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
