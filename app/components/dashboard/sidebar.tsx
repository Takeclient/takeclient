'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  tenantName?: string;
}

interface PlanInfo {
  plan: {
    displayName: string;
  };
  limits: {
    contacts: { used: number; limit: number; percentage: number };
  };
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[];
  subItems?: Omit<NavigationItem, 'roles' | 'subItems'>[];
}

interface NavigationCategory {
  name: string;
  icon: string;
  items: NavigationItem[];
  roles?: string[];
}

export function Sidebar({ tenantName = 'Your Company' }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['CRM', 'Sales', 'Marketing']);
  const [expandedSubMenus, setExpandedSubMenus] = useState<string[]>([]);

  useEffect(() => {
    // Fetch plan info only for regular tenants (not super admins)
    if (user && !user.isSuperAdmin && user.tenantId) {
      fetchPlanInfo();
    }
  }, [user]);

  const fetchPlanInfo = async () => {
    try {
      const response = await fetch('/api/billing/current-plan');
      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
      }
    } catch (error) {
      console.error('Error fetching plan info:', error);
    }
  };

  // Organized navigation categories
  const navigationCategories: NavigationCategory[] = [
    {
      name: 'CRM',
      icon: 'fa-users',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: 'fa-home' },
        { name: 'Contacts', href: '/dashboard/contacts', icon: 'fa-address-book' },
        { name: 'Contact Pipeline', href: '/dashboard/contacts/kanban', icon: 'fa-columns', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
        { name: 'Companies', href: '/dashboard/companies', icon: 'fa-building' },
        { name: 'Activities', href: '/dashboard/activities', icon: 'fa-calendar-check' },
        { name: 'Tasks', href: '/dashboard/tasks', icon: 'fa-tasks' },
      ],
    },
    {
      name: 'Sales',
      icon: 'fa-chart-line',
      items: [
        { name: 'Leads', href: '/dashboard/leads', icon: 'fa-user-plus' },
        { name: 'Deals', href: '/dashboard/deals', icon: 'fa-handshake' },
        { name: 'Quotations', href: '/dashboard/quotations', icon: 'fa-file-invoice' },
        { name: 'Invoices', href: '/dashboard/invoices', icon: 'fa-file-invoice' },
        { name: 'Pipelines', href: '/dashboard/pipelines', icon: 'fa-chart-line' },
      ],
    },
    {
      name: 'Marketing',
      icon: 'fa-bullhorn',
      items: [
        { 
          name: 'WhatsApp', 
          href: '/dashboard/whatsapp', 
          icon: 'fa-brands fa-whatsapp', 
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'],
          subItems: [
            { name: 'Conversations', href: '/dashboard/whatsapp?tab=conversations', icon: 'fa-comments' },
            { name: 'Integrations', href: '/dashboard/whatsapp?tab=integrations', icon: 'fa-plug' },
            { name: 'Templates', href: '/dashboard/whatsapp?tab=templates', icon: 'fa-file-alt' },
            { name: 'Broadcast', href: '/dashboard/whatsapp/broadcast', icon: 'fa-broadcast-tower' },
            { name: 'Contacts', href: '/dashboard/whatsapp/contacts', icon: 'fa-address-book' },
            { name: 'Analytics', href: '/dashboard/whatsapp/analytics', icon: 'fa-chart-line' },
            { name: 'Settings', href: '/dashboard/whatsapp?tab=settings', icon: 'fa-cog' },
          ]
        },
        { name: 'Form Builder', href: '/dashboard/form-builder', icon: 'fa-edit', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'] },
        { 
          name: 'GMB', 
          href: '/dashboard/marketing/gmb', 
          icon: 'fa-map-marker-alt', 
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'],
          subItems: [
            { name: 'Overview', href: '/dashboard/marketing/gmb/overview', icon: 'fa-chart-pie' },
            { name: 'Reviews', href: '/dashboard/marketing/gmb/reviews', icon: 'fa-star' },
            { name: 'Posts', href: '/dashboard/marketing/gmb/posts', icon: 'fa-bullhorn' },
            { name: 'Insights', href: '/dashboard/marketing/gmb/insights', icon: 'fa-chart-line' },
            { name: 'Settings', href: '/dashboard/marketing/gmb/settings', icon: 'fa-cog' },
          ]
        },
        { 
          name: 'Email Marketing', 
          href: '/dashboard/email-marketing', 
          icon: 'fa-envelope', 
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'],
          subItems: [
            { name: 'Campaigns', href: '/dashboard/email-marketing?tab=campaigns', icon: 'fa-rocket' },
            { name: 'Templates', href: '/dashboard/email-marketing?tab=templates', icon: 'fa-file-alt' },
            { name: 'Lists', href: '/dashboard/email-marketing?tab=lists', icon: 'fa-users' },
            { name: 'Providers', href: '/dashboard/email-marketing?tab=providers', icon: 'fa-server' },
            { name: 'Analytics', href: '/dashboard/email-marketing?tab=analytics', icon: 'fa-chart-line' },
          ]
        },
        { name: 'Landing Pages', href: '/dashboard/landing-pages', icon: 'fa-file', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'] },
        { name: 'Domains', href: '/dashboard/domains', icon: 'fa-globe', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'] },
        { name: 'Lead Scoring', href: '/dashboard/lead-scoring', icon: 'fa-star', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'] },
        { 
          name: 'Social Media', 
          href: '/dashboard/social-media', 
          icon: 'fa-share-alt', 
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'],
          subItems: [
            { name: 'Calendar', href: '/dashboard/social-media/calendar', icon: 'fa-calendar-alt' },
            { name: 'Auto Posting', href: '/dashboard/social-media/auto-posting', icon: 'fa-robot' },
            { name: 'Messages', href: '/dashboard/social-media/messages', icon: 'fa-comments' },
            { name: 'Instagram', href: '/dashboard/social-media?platform=instagram', icon: 'fa-brands fa-instagram' },
            { name: 'Facebook', href: '/dashboard/social-media?platform=facebook', icon: 'fa-brands fa-facebook' },
            { name: 'X (Twitter)', href: '/dashboard/social-media?platform=twitter', icon: 'fa-brands fa-x-twitter' },
            { name: 'TikTok', href: '/dashboard/social-media?platform=tiktok', icon: 'fa-brands fa-tiktok' },
            { name: 'Snapchat', href: '/dashboard/social-media?platform=snapchat', icon: 'fa-brands fa-snapchat' },
            { name: 'Analytics', href: '/dashboard/social-media/analytics', icon: 'fa-chart-line' },
            { name: 'Settings', href: '/dashboard/social-media/settings', icon: 'fa-cog' },
          ]
        },
        { 
          name: 'Ads Management', 
          href: '/dashboard/ads', 
          icon: 'fa-ad', 
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'MARKETER'],
          subItems: [
            { name: 'Google Ads', href: '/dashboard/ads/google', icon: 'fa-brands fa-google' },
            { name: 'Meta Ads', href: '/dashboard/ads/meta', icon: 'fa-brands fa-facebook' },
          ]
        },
      ],
    },
    {
      name: 'Ecommerce',
      icon: 'fa-shopping-cart',
      items: [
        { name: 'Products', href: '/dashboard/ecommerce/products', icon: 'fa-box' },
        { name: 'Orders', href: '/dashboard/ecommerce/orders', icon: 'fa-shopping-bag' },
        { name: 'Customers', href: '/dashboard/ecommerce/customers', icon: 'fa-user-friends' },
        { name: 'Inventory', href: '/dashboard/ecommerce/inventory', icon: 'fa-warehouse' },
        { name: 'Payments', href: '/dashboard/ecommerce/payments', icon: 'fa-credit-card' },
      ],
    },
    {
      name: 'AI Agents',
      icon: 'fa-robot',
      items: [
        { name: 'Agent Hub', href: '/dashboard/ai-agents', icon: 'fa-home' },
        { name: 'Create Agent', href: '/dashboard/ai-agents/create', icon: 'fa-plus-circle' },
        { name: 'Training', href: '/dashboard/ai-agents/training', icon: 'fa-graduation-cap' },
        { name: 'Conversations', href: '/dashboard/ai-agents/conversations', icon: 'fa-comments' },
        { name: 'Analytics', href: '/dashboard/ai-agents/analytics', icon: 'fa-chart-line' },
        { name: 'Integrations', href: '/dashboard/ai-agents/integrations', icon: 'fa-plug' },
        { name: 'Templates', href: '/dashboard/ai-agents/templates', icon: 'fa-file-alt' },
      ],
    },
    {
      name: 'Automation',
      icon: 'fa-cogs',
      items: [
        { name: 'Workflows', href: '/dashboard/workflows', icon: 'fa-diagram-project' },
        { name: 'Email Automation', href: '/dashboard/email-automation', icon: 'fa-envelope-circle-check' },
        { name: 'Lead Nurturing', href: '/dashboard/lead-nurturing', icon: 'fa-seedling' },
        { name: 'Triggers', href: '/dashboard/triggers', icon: 'fa-bolt' },
        { name: 'Integrations', href: '/dashboard/integrations', icon: 'fa-plug', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
      ],
    },
    {
      name: 'Reporting',
      icon: 'fa-chart-bar',
      items: [
        { name: 'Reports', href: '/dashboard/reports', icon: 'fa-chart-bar', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
        { name: 'Analytics', href: '/dashboard/analytics', icon: 'fa-analytics', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
        { name: 'Dashboards', href: '/dashboard/custom-dashboards', icon: 'fa-tachometer-alt', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
        { name: 'Data Export', href: '/dashboard/data-export', icon: 'fa-download', roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'] },
      ],
    },
  ];

  // Admin navigation (separate from categories)
  const adminNavigation = [
    ...(user?.role && ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role) ? [
      { name: 'Teams', href: '/dashboard/teams', icon: 'fa-users-cog' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'fa-cog' },
      { name: 'Billing', href: '/dashboard/billing', icon: 'fa-credit-card' },
    ] : []),
    
    // Super Admin only
    ...(user?.isSuperAdmin ? [
      { name: 'Admin Dashboard', href: '/admin', icon: 'fa-shield-alt' },
      { name: 'Plan Management', href: '/admin/plans', icon: 'fa-layer-group' },
      { name: 'Tenant Management', href: '/admin/tenants', icon: 'fa-building-user' },
      { name: 'User Management', href: '/admin/users', icon: 'fa-users-cog' },
      { name: 'System Analytics', href: '/admin/analytics', icon: 'fa-chart-line' },
    ] : []),
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const hasPermission = (item: NavigationItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const hasCategoryPermission = (category: NavigationCategory) => {
    if (!category.roles) {
      // If category has no role restriction, check if any item is accessible
      return category.items.some(item => hasPermission(item));
    }
    return user?.role && category.roles.includes(user.role);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleSubMenu = (itemName: string) => {
    setExpandedSubMenus(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      TENANT_ADMIN: 'Admin',
      MANAGER: 'Manager',
      MARKETER: 'Marketing',
      SALES: 'Sales',
      SUPPORT: 'Support',
      USER: 'User',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <div className="px-4 py-5">
        {/* Navigation Categories */}
        <div className="space-y-2">
          {navigationCategories.map((category) => {
            if (!hasCategoryPermission(category)) return null;
            
            const isExpanded = expandedCategories.includes(category.name);
            const accessibleItems = category.items.filter(item => hasPermission(item));
            
            if (accessibleItems.length === 0) return null;

            return (
              <div key={category.name}>
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <div className="flex items-center">
                    <i className={`fas ${category.icon} mr-3 text-gray-500`}></i>
                    <span>{category.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {accessibleItems.map((item) => {
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isSubMenuExpanded = expandedSubMenus.includes(item.name);
                      
                      if (hasSubItems) {
                        return (
                          <div key={item.name}>
                            <button
                              onClick={() => toggleSubMenu(item.name)}
                              className={`w-full group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                                isActive(item.href) || item.subItems?.some(sub => isActive(sub.href))
                                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <div className="flex items-center">
                                <i className={`fas ${item.icon} mr-3 ${
                                  isActive(item.href) || item.subItems?.some(sub => isActive(sub.href))
                                    ? 'text-red-500' 
                                    : 'text-gray-500 group-hover:text-gray-500'
                                }`}></i>
                                {item.name}
                              </div>
                              {isSubMenuExpanded ? (
                                <ChevronDownIcon className="h-3 w-3 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                              )}
                            </button>
                            
                            {isSubMenuExpanded && item.subItems && (
                              <div className="ml-8 mt-1 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md ${
                                      isActive(subItem.href)
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                  >
                                    <i className={`fas ${subItem.icon} mr-2 text-xs ${
                                      isActive(subItem.href) ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}></i>
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive(item.href)
                              ? 'text-red-600 bg-red-50 hover:bg-red-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <i className={`fas ${item.icon} mr-3 ${
                            isActive(item.href) ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-500'
                          }`}></i>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Admin Section */}
        {adminNavigation.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Administration
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <i className={`fas ${item.icon} mr-3 ${
                    isActive(item.href) ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-500'
                  }`}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Tenant Selection */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Current Workspace
        </h3>
        <div className="mt-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {tenantName?.charAt(0) || 'T'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{tenantName}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || 'USER')}</p>
            </div>
          </div>
          
          {/* Plan Information */}
          {!user?.isSuperAdmin && planInfo && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {planInfo.plan.displayName}
                </span>
                <Link 
                  href="/dashboard/billing"
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Upgrade
                </Link>
              </div>
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Contacts</span>
                  <span>
                    {planInfo.limits.contacts.used}/
                    {planInfo.limits.contacts.limit === -1 ? '∞' : planInfo.limits.contacts.limit}
                  </span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      planInfo.limits.contacts.percentage >= 90 ? 'bg-red-600' :
                      planInfo.limits.contacts.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(planInfo.limits.contacts.percentage, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {planInfo.limits.contacts.percentage}% used
                </p>
              </div>
            </div>
          )}
          
          {user?.isSuperAdmin && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <span className="text-xs font-medium text-blue-700">🛡️ Super Admin Access</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="space-y-1">
          <Link
            href="/dashboard/contacts/new"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <i className="fas fa-plus mr-3 text-gray-500"></i>
            Add Contact
          </Link>
          <Link
            href="/dashboard/deals/new"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <i className="fas fa-handshake mr-3 text-gray-500"></i>
            New Deal
          </Link>
          <Link
            href="/dashboard/companies/new"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <i className="fas fa-building mr-3 text-gray-500"></i>
            Add Company
          </Link>
        </div>
      </div>
      
      <div className="px-4 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <i className="fas fa-sign-out-alt mr-3 text-gray-500 group-hover:text-gray-500"></i>
          Sign out
        </button>
      </div>
    </div>
  );
}
