import { Role } from '@prisma/client';

// Legacy Permission enum for admin functionality (kept for backward compatibility)
export enum Permission {
  MANAGE_SYSTEM = "system.manage_system",
  MANAGE_ALL_TENANTS = "system.manage_all_tenants", 
  VIEW_AUDIT_LOGS = "system.view_audit_logs",
  MANAGE_TEAM = "team.manage_team",
}

// Permission categories and their specific permissions
export const PERMISSION_CATEGORIES = {
  CONTACTS: "contacts",
  COMPANIES: "companies",
  DEALS: "deals",
  TASKS: "tasks",
  PRODUCTS: "products",
  INVOICES: "invoices",
  QUOTATIONS: "quotations",
  WORKFLOWS: "workflows",
  FORMS: "forms",
  EMAIL_CAMPAIGNS: "email_campaigns",
  LANDING_PAGES: "landing_pages",
  ANALYTICS: "analytics",
  SETTINGS: "settings",
  TEAM_MANAGEMENT: "team_management",
  BILLING: "billing",
} as const;

export const PERMISSIONS = {
  // Contacts permissions
  [PERMISSION_CATEGORIES.CONTACTS]: {
    VIEW: "contacts.view",
    CREATE: "contacts.create",
    EDIT: "contacts.edit",
    DELETE: "contacts.delete",
    EXPORT: "contacts.export",
    IMPORT: "contacts.import",
    MANAGE_ALL: "contacts.manage_all",
  },
  
  // Companies permissions
  [PERMISSION_CATEGORIES.COMPANIES]: {
    VIEW: "companies.view",
    CREATE: "companies.create",
    EDIT: "companies.edit",
    DELETE: "companies.delete",
    EXPORT: "companies.export",
    MANAGE_ALL: "companies.manage_all",
  },
  
  // Deals permissions
  [PERMISSION_CATEGORIES.DEALS]: {
    VIEW: "deals.view",
    CREATE: "deals.create",
    EDIT: "deals.edit",
    DELETE: "deals.delete",
    CHANGE_STAGE: "deals.change_stage",
    MANAGE_ALL: "deals.manage_all",
  },
  
  // Tasks permissions
  [PERMISSION_CATEGORIES.TASKS]: {
    VIEW: "tasks.view",
    CREATE: "tasks.create",
    EDIT: "tasks.edit",
    DELETE: "tasks.delete",
    ASSIGN: "tasks.assign",
    COMPLETE: "tasks.complete",
    MANAGE_ALL: "tasks.manage_all",
  },
  
  // Products permissions
  [PERMISSION_CATEGORIES.PRODUCTS]: {
    VIEW: "products.view",
    CREATE: "products.create",
    EDIT: "products.edit",
    DELETE: "products.delete",
    MANAGE_INVENTORY: "products.manage_inventory",
    MANAGE_ALL: "products.manage_all",
  },
  
  // Invoices permissions
  [PERMISSION_CATEGORIES.INVOICES]: {
    VIEW: "invoices.view",
    CREATE: "invoices.create",
    EDIT: "invoices.edit",
    DELETE: "invoices.delete",
    SEND: "invoices.send",
    MARK_PAID: "invoices.mark_paid",
    MANAGE_ALL: "invoices.manage_all",
  },
  
  // Quotations permissions
  [PERMISSION_CATEGORIES.QUOTATIONS]: {
    VIEW: "quotations.view",
    CREATE: "quotations.create",
    EDIT: "quotations.edit",
    DELETE: "quotations.delete",
    SEND: "quotations.send",
    CONVERT: "quotations.convert",
    MANAGE_ALL: "quotations.manage_all",
  },
  
  // Workflows permissions
  [PERMISSION_CATEGORIES.WORKFLOWS]: {
    VIEW: "workflows.view",
    CREATE: "workflows.create",
    EDIT: "workflows.edit",
    DELETE: "workflows.delete",
    EXECUTE: "workflows.execute",
    MANAGE_ALL: "workflows.manage_all",
  },
  
  // Forms permissions
  [PERMISSION_CATEGORIES.FORMS]: {
    VIEW: "forms.view",
    CREATE: "forms.create",
    EDIT: "forms.edit",
    DELETE: "forms.delete",
    VIEW_SUBMISSIONS: "forms.view_submissions",
    MANAGE_ALL: "forms.manage_all",
  },
  
  // Email campaigns permissions
  [PERMISSION_CATEGORIES.EMAIL_CAMPAIGNS]: {
    VIEW: "email_campaigns.view",
    CREATE: "email_campaigns.create",
    EDIT: "email_campaigns.edit",
    DELETE: "email_campaigns.delete",
    SEND: "email_campaigns.send",
    MANAGE_ALL: "email_campaigns.manage_all",
  },
  
  // Landing pages permissions
  [PERMISSION_CATEGORIES.LANDING_PAGES]: {
    VIEW: "landing_pages.view",
    CREATE: "landing_pages.create",
    EDIT: "landing_pages.edit",
    DELETE: "landing_pages.delete",
    PUBLISH: "landing_pages.publish",
    MANAGE_ALL: "landing_pages.manage_all",
  },
  
  // Analytics permissions
  [PERMISSION_CATEGORIES.ANALYTICS]: {
    VIEW_DASHBOARD: "analytics.view_dashboard",
    VIEW_REPORTS: "analytics.view_reports",
    EXPORT_REPORTS: "analytics.export_reports",
    MANAGE_ALL: "analytics.manage_all",
  },
  
  // Settings permissions
  [PERMISSION_CATEGORIES.SETTINGS]: {
    VIEW: "settings.view",
    EDIT_BUSINESS: "settings.edit_business",
    MANAGE_INTEGRATIONS: "settings.manage_integrations",
    MANAGE_PIPELINES: "settings.manage_pipelines",
    MANAGE_ALL: "settings.manage_all",
  },
  
  // Team management permissions
  [PERMISSION_CATEGORIES.TEAM_MANAGEMENT]: {
    VIEW_TEAMS: "team_management.view_teams",
    CREATE_TEAMS: "team_management.create_teams",
    EDIT_TEAMS: "team_management.edit_teams",
    DELETE_TEAMS: "team_management.delete_teams",
    INVITE_MEMBERS: "team_management.invite_members",
    REMOVE_MEMBERS: "team_management.remove_members",
    MANAGE_ROLES: "team_management.manage_roles",
    MANAGE_ALL: "team_management.manage_all",
  },
  
  // Billing permissions
  [PERMISSION_CATEGORIES.BILLING]: {
    VIEW: "billing.view",
    MANAGE_SUBSCRIPTION: "billing.manage_subscription",
    VIEW_INVOICES: "billing.view_invoices",
    MANAGE_ALL: "billing.manage_all",
  },
} as const;

// Default role templates
export const DEFAULT_ROLES = {
  ADMIN: {
    name: "Administrator",
    description: "Full access to all features",
    permissions: Object.values(PERMISSIONS).flatMap(category => 
      Object.values(category)
    ),
  },
  MANAGER: {
    name: "Manager",
    description: "Manage team activities and reports",
    permissions: [
      // Contacts
      PERMISSIONS.contacts.VIEW,
      PERMISSIONS.contacts.CREATE,
      PERMISSIONS.contacts.EDIT,
      PERMISSIONS.contacts.DELETE,
      PERMISSIONS.contacts.EXPORT,
      PERMISSIONS.contacts.MANAGE_ALL,
      
      // Companies
      PERMISSIONS.companies.VIEW,
      PERMISSIONS.companies.CREATE,
      PERMISSIONS.companies.EDIT,
      PERMISSIONS.companies.DELETE,
      PERMISSIONS.companies.MANAGE_ALL,
      
      // Deals
      PERMISSIONS.deals.VIEW,
      PERMISSIONS.deals.CREATE,
      PERMISSIONS.deals.EDIT,
      PERMISSIONS.deals.DELETE,
      PERMISSIONS.deals.CHANGE_STAGE,
      PERMISSIONS.deals.MANAGE_ALL,
      
      // Tasks
      PERMISSIONS.tasks.VIEW,
      PERMISSIONS.tasks.CREATE,
      PERMISSIONS.tasks.EDIT,
      PERMISSIONS.tasks.DELETE,
      PERMISSIONS.tasks.ASSIGN,
      PERMISSIONS.tasks.COMPLETE,
      PERMISSIONS.tasks.MANAGE_ALL,
      
      // Products
      PERMISSIONS.products.VIEW,
      PERMISSIONS.products.CREATE,
      PERMISSIONS.products.EDIT,
      
      // Invoices
      PERMISSIONS.invoices.VIEW,
      PERMISSIONS.invoices.CREATE,
      PERMISSIONS.invoices.EDIT,
      PERMISSIONS.invoices.SEND,
      
      // Quotations
      PERMISSIONS.quotations.VIEW,
      PERMISSIONS.quotations.CREATE,
      PERMISSIONS.quotations.EDIT,
      PERMISSIONS.quotations.SEND,
      
      // Analytics
      PERMISSIONS.analytics.VIEW_DASHBOARD,
      PERMISSIONS.analytics.VIEW_REPORTS,
      PERMISSIONS.analytics.EXPORT_REPORTS,
      
      // Team Management
      PERMISSIONS.team_management.VIEW_TEAMS,
      PERMISSIONS.team_management.INVITE_MEMBERS,
    ],
  },
  SALES_REP: {
    name: "Sales Representative",
    description: "Manage own contacts, deals, and tasks",
    permissions: [
      // Contacts
      PERMISSIONS.contacts.VIEW,
      PERMISSIONS.contacts.CREATE,
      PERMISSIONS.contacts.EDIT,
      
      // Companies
      PERMISSIONS.companies.VIEW,
      PERMISSIONS.companies.CREATE,
      PERMISSIONS.companies.EDIT,
      
      // Deals
      PERMISSIONS.deals.VIEW,
      PERMISSIONS.deals.CREATE,
      PERMISSIONS.deals.EDIT,
      PERMISSIONS.deals.CHANGE_STAGE,
      
      // Tasks
      PERMISSIONS.tasks.VIEW,
      PERMISSIONS.tasks.CREATE,
      PERMISSIONS.tasks.EDIT,
      PERMISSIONS.tasks.COMPLETE,
      
      // Products
      PERMISSIONS.products.VIEW,
      
      // Quotations
      PERMISSIONS.quotations.VIEW,
      PERMISSIONS.quotations.CREATE,
      PERMISSIONS.quotations.EDIT,
      PERMISSIONS.quotations.SEND,
      
      // Analytics
      PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
  MARKETING: {
    name: "Marketing",
    description: "Manage marketing campaigns and content",
    permissions: [
      // Contacts
      PERMISSIONS.contacts.VIEW,
      PERMISSIONS.contacts.CREATE,
      PERMISSIONS.contacts.EDIT,
      PERMISSIONS.contacts.IMPORT,
      
      // Forms
      PERMISSIONS.forms.VIEW,
      PERMISSIONS.forms.CREATE,
      PERMISSIONS.forms.EDIT,
      PERMISSIONS.forms.DELETE,
      PERMISSIONS.forms.VIEW_SUBMISSIONS,
      PERMISSIONS.forms.MANAGE_ALL,
      
      // Email Campaigns
      PERMISSIONS.email_campaigns.VIEW,
      PERMISSIONS.email_campaigns.CREATE,
      PERMISSIONS.email_campaigns.EDIT,
      PERMISSIONS.email_campaigns.DELETE,
      PERMISSIONS.email_campaigns.SEND,
      PERMISSIONS.email_campaigns.MANAGE_ALL,
      
      // Landing Pages
      PERMISSIONS.landing_pages.VIEW,
      PERMISSIONS.landing_pages.CREATE,
      PERMISSIONS.landing_pages.EDIT,
      PERMISSIONS.landing_pages.DELETE,
      PERMISSIONS.landing_pages.PUBLISH,
      PERMISSIONS.landing_pages.MANAGE_ALL,
      
      // Analytics
      PERMISSIONS.analytics.VIEW_DASHBOARD,
      PERMISSIONS.analytics.VIEW_REPORTS,
    ],
  },
  SUPPORT: {
    name: "Support",
    description: "View and assist with customer issues",
    permissions: [
      // Contacts
      PERMISSIONS.contacts.VIEW,
      PERMISSIONS.contacts.EDIT,
      
      // Companies
      PERMISSIONS.companies.VIEW,
      
      // Deals
      PERMISSIONS.deals.VIEW,
      
      // Tasks
      PERMISSIONS.tasks.VIEW,
      PERMISSIONS.tasks.CREATE,
      PERMISSIONS.tasks.EDIT,
      PERMISSIONS.tasks.COMPLETE,
      
      // Invoices
      PERMISSIONS.invoices.VIEW,
      
      // Analytics
      PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access",
    permissions: [
      PERMISSIONS.contacts.VIEW,
      PERMISSIONS.companies.VIEW,
      PERMISSIONS.deals.VIEW,
      PERMISSIONS.tasks.VIEW,
      PERMISSIONS.products.VIEW,
      PERMISSIONS.invoices.VIEW,
      PERMISSIONS.quotations.VIEW,
      PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
};

// Helper function to check permissions (supports both legacy Role-based and new permission arrays)
export function hasPermission(
  userRoleOrPermissions: any,
  requiredPermission: any,
  legacyUserPermissions?: string[] | null | undefined
): boolean {
  // Legacy Role-based admin permission check (for backward compatibility)
  if (typeof userRoleOrPermissions === 'string' && typeof requiredPermission !== 'string') {
    const userRole = userRoleOrPermissions;
    const permission = requiredPermission;
    
    // Super admin has all permissions
    if (userRole === 'SUPER_ADMIN') return true;
    
    // Check specific admin permissions
    switch (permission) {
      case Permission.MANAGE_SYSTEM:
        return userRole === 'SUPER_ADMIN';
      case Permission.MANAGE_ALL_TENANTS:
        return userRole === 'SUPER_ADMIN';
      case Permission.VIEW_AUDIT_LOGS:
        return userRole === 'SUPER_ADMIN' || userRole === 'TENANT_ADMIN';
      case Permission.MANAGE_TEAM:
        return userRole === 'SUPER_ADMIN' || userRole === 'TENANT_ADMIN' || userRole === 'MANAGER';
      default:
        return false;
    }
  }
  
  // New permission system check
  const permissions = Array.isArray(userRoleOrPermissions) ? userRoleOrPermissions : [];
  const permissionString = typeof requiredPermission === 'string' ? requiredPermission : '';
  
  if (!permissions || permissions.length === 0) return false;
  return permissions.includes(permissionString);
}

// Helper function to check multiple permissions (AND)
export function hasAllPermissions(
  userPermissions: string[] | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}

// Helper function to check multiple permissions (OR)
export function hasAnyPermission(
  userPermissions: string[] | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
}

// Get all permissions flat list
export function getAllPermissions(): Array<{
  name: string;
  category: string;
  description: string;
}> {
  const allPermissions: Array<{
    name: string;
    category: string;
    description: string;
  }> = [];
  
  Object.entries(PERMISSIONS).forEach(([category, permissions]) => {
    Object.entries(permissions).forEach(([key, value]) => {
      allPermissions.push({
        name: value,
        category,
        description: key.toLowerCase().replace(/_/g, " "),
      });
    });
  });
  
  return allPermissions;
}

// Get permissions by category
export function getPermissionsByCategory(category: string) {
  return PERMISSIONS[category as keyof typeof PERMISSIONS] || {};
}

// Permission group structure for UI
export const PERMISSION_GROUPS = [
  {
    title: "CRM",
    categories: [
      PERMISSION_CATEGORIES.CONTACTS,
      PERMISSION_CATEGORIES.COMPANIES,
      PERMISSION_CATEGORIES.DEALS,
      PERMISSION_CATEGORIES.TASKS,
    ],
  },
  {
    title: "Sales",
    categories: [
      PERMISSION_CATEGORIES.PRODUCTS,
      PERMISSION_CATEGORIES.INVOICES,
      PERMISSION_CATEGORIES.QUOTATIONS,
    ],
  },
  {
    title: "Marketing",
    categories: [
      PERMISSION_CATEGORIES.EMAIL_CAMPAIGNS,
      PERMISSION_CATEGORIES.FORMS,
      PERMISSION_CATEGORIES.LANDING_PAGES,
    ],
  },
  {
    title: "Automation",
    categories: [
      PERMISSION_CATEGORIES.WORKFLOWS,
    ],
  },
  {
    title: "Management",
    categories: [
      PERMISSION_CATEGORIES.ANALYTICS,
      PERMISSION_CATEGORIES.SETTINGS,
      PERMISSION_CATEGORIES.TEAM_MANAGEMENT,
      PERMISSION_CATEGORIES.BILLING,
    ],
  },
];

// Role descriptions for the legacy Role enum (keeping for backward compatibility)
export const ROLE_DESCRIPTIONS = {
  SUPER_ADMIN: 'Full platform access - can manage all tenants, plans, and system configuration',
  TENANT_ADMIN: 'Tenant administrator - can manage users, billing, and all tenant features',
  MANAGER: 'Team manager - can manage team members and access most features',
  MARKETER: 'Marketing team - can manage forms, campaigns, and marketing analytics',
  SALES: 'Sales team - can manage deals, companies, and sales analytics',
  SUPPORT: 'Support team - can access support tickets and basic customer information',
  USER: 'Regular user - basic access to view and submit forms',
};

// Helper functions for legacy Role enum (keeping for backward compatibility)
export function isSuperAdmin(userRole: Role): boolean {
  return userRole === 'SUPER_ADMIN';
}

export function isTenantAdmin(userRole: Role): boolean {
  return userRole === 'TENANT_ADMIN' || userRole === 'SUPER_ADMIN';
}

export { Role }; 