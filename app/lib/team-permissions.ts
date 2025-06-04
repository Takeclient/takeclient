// Team permission categories and their specific permissions
export const TEAM_PERMISSION_CATEGORIES = {
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

export const TEAM_PERMISSIONS = {
  // Contacts permissions
  [TEAM_PERMISSION_CATEGORIES.CONTACTS]: {
    VIEW: "contacts.view",
    CREATE: "contacts.create",
    EDIT: "contacts.edit",
    DELETE: "contacts.delete",
    EXPORT: "contacts.export",
    IMPORT: "contacts.import",
    MANAGE_ALL: "contacts.manage_all",
  },
  
  // Companies permissions
  [TEAM_PERMISSION_CATEGORIES.COMPANIES]: {
    VIEW: "companies.view",
    CREATE: "companies.create",
    EDIT: "companies.edit",
    DELETE: "companies.delete",
    EXPORT: "companies.export",
    MANAGE_ALL: "companies.manage_all",
  },
  
  // Deals permissions
  [TEAM_PERMISSION_CATEGORIES.DEALS]: {
    VIEW: "deals.view",
    CREATE: "deals.create",
    EDIT: "deals.edit",
    DELETE: "deals.delete",
    CHANGE_STAGE: "deals.change_stage",
    MANAGE_ALL: "deals.manage_all",
  },
  
  // Tasks permissions
  [TEAM_PERMISSION_CATEGORIES.TASKS]: {
    VIEW: "tasks.view",
    CREATE: "tasks.create",
    EDIT: "tasks.edit",
    DELETE: "tasks.delete",
    ASSIGN: "tasks.assign",
    COMPLETE: "tasks.complete",
    MANAGE_ALL: "tasks.manage_all",
  },
  
  // Products permissions
  [TEAM_PERMISSION_CATEGORIES.PRODUCTS]: {
    VIEW: "products.view",
    CREATE: "products.create",
    EDIT: "products.edit",
    DELETE: "products.delete",
    MANAGE_INVENTORY: "products.manage_inventory",
    MANAGE_ALL: "products.manage_all",
  },
  
  // Invoices permissions
  [TEAM_PERMISSION_CATEGORIES.INVOICES]: {
    VIEW: "invoices.view",
    CREATE: "invoices.create",
    EDIT: "invoices.edit",
    DELETE: "invoices.delete",
    SEND: "invoices.send",
    MARK_PAID: "invoices.mark_paid",
    MANAGE_ALL: "invoices.manage_all",
  },
  
  // Quotations permissions
  [TEAM_PERMISSION_CATEGORIES.QUOTATIONS]: {
    VIEW: "quotations.view",
    CREATE: "quotations.create",
    EDIT: "quotations.edit",
    DELETE: "quotations.delete",
    SEND: "quotations.send",
    CONVERT: "quotations.convert",
    MANAGE_ALL: "quotations.manage_all",
  },
  
  // Workflows permissions
  [TEAM_PERMISSION_CATEGORIES.WORKFLOWS]: {
    VIEW: "workflows.view",
    CREATE: "workflows.create",
    EDIT: "workflows.edit",
    DELETE: "workflows.delete",
    EXECUTE: "workflows.execute",
    MANAGE_ALL: "workflows.manage_all",
  },
  
  // Forms permissions
  [TEAM_PERMISSION_CATEGORIES.FORMS]: {
    VIEW: "forms.view",
    CREATE: "forms.create",
    EDIT: "forms.edit",
    DELETE: "forms.delete",
    VIEW_SUBMISSIONS: "forms.view_submissions",
    MANAGE_ALL: "forms.manage_all",
  },
  
  // Email campaigns permissions
  [TEAM_PERMISSION_CATEGORIES.EMAIL_CAMPAIGNS]: {
    VIEW: "email_campaigns.view",
    CREATE: "email_campaigns.create",
    EDIT: "email_campaigns.edit",
    DELETE: "email_campaigns.delete",
    SEND: "email_campaigns.send",
    MANAGE_ALL: "email_campaigns.manage_all",
  },
  
  // Landing pages permissions
  [TEAM_PERMISSION_CATEGORIES.LANDING_PAGES]: {
    VIEW: "landing_pages.view",
    CREATE: "landing_pages.create",
    EDIT: "landing_pages.edit",
    DELETE: "landing_pages.delete",
    PUBLISH: "landing_pages.publish",
    MANAGE_ALL: "landing_pages.manage_all",
  },
  
  // Analytics permissions
  [TEAM_PERMISSION_CATEGORIES.ANALYTICS]: {
    VIEW_DASHBOARD: "analytics.view_dashboard",
    VIEW_REPORTS: "analytics.view_reports",
    EXPORT_REPORTS: "analytics.export_reports",
    MANAGE_ALL: "analytics.manage_all",
  },
  
  // Settings permissions
  [TEAM_PERMISSION_CATEGORIES.SETTINGS]: {
    VIEW: "settings.view",
    EDIT_BUSINESS: "settings.edit_business",
    MANAGE_INTEGRATIONS: "settings.manage_integrations",
    MANAGE_PIPELINES: "settings.manage_pipelines",
    MANAGE_ALL: "settings.manage_all",
  },
  
  // Team management permissions
  [TEAM_PERMISSION_CATEGORIES.TEAM_MANAGEMENT]: {
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
  [TEAM_PERMISSION_CATEGORIES.BILLING]: {
    VIEW: "billing.view",
    MANAGE_SUBSCRIPTION: "billing.manage_subscription",
    VIEW_INVOICES: "billing.view_invoices",
    MANAGE_ALL: "billing.manage_all",
  },
} as const;

// Default team role templates
export const DEFAULT_TEAM_ROLES = {
  ADMIN: {
    name: "Administrator",
    description: "Full access to all features",
    permissions: Object.values(TEAM_PERMISSIONS).flatMap(category => 
      Object.values(category)
    ),
  },
  MANAGER: {
    name: "Manager",
    description: "Manage team activities and reports",
    permissions: [
      // Contacts
      TEAM_PERMISSIONS.contacts.VIEW,
      TEAM_PERMISSIONS.contacts.CREATE,
      TEAM_PERMISSIONS.contacts.EDIT,
      TEAM_PERMISSIONS.contacts.DELETE,
      TEAM_PERMISSIONS.contacts.EXPORT,
      TEAM_PERMISSIONS.contacts.MANAGE_ALL,
      
      // Companies
      TEAM_PERMISSIONS.companies.VIEW,
      TEAM_PERMISSIONS.companies.CREATE,
      TEAM_PERMISSIONS.companies.EDIT,
      TEAM_PERMISSIONS.companies.DELETE,
      TEAM_PERMISSIONS.companies.MANAGE_ALL,
      
      // Deals
      TEAM_PERMISSIONS.deals.VIEW,
      TEAM_PERMISSIONS.deals.CREATE,
      TEAM_PERMISSIONS.deals.EDIT,
      TEAM_PERMISSIONS.deals.DELETE,
      TEAM_PERMISSIONS.deals.CHANGE_STAGE,
      TEAM_PERMISSIONS.deals.MANAGE_ALL,
      
      // Tasks
      TEAM_PERMISSIONS.tasks.VIEW,
      TEAM_PERMISSIONS.tasks.CREATE,
      TEAM_PERMISSIONS.tasks.EDIT,
      TEAM_PERMISSIONS.tasks.DELETE,
      TEAM_PERMISSIONS.tasks.ASSIGN,
      TEAM_PERMISSIONS.tasks.COMPLETE,
      TEAM_PERMISSIONS.tasks.MANAGE_ALL,
      
      // Products
      TEAM_PERMISSIONS.products.VIEW,
      TEAM_PERMISSIONS.products.CREATE,
      TEAM_PERMISSIONS.products.EDIT,
      
      // Invoices
      TEAM_PERMISSIONS.invoices.VIEW,
      TEAM_PERMISSIONS.invoices.CREATE,
      TEAM_PERMISSIONS.invoices.EDIT,
      TEAM_PERMISSIONS.invoices.SEND,
      
      // Quotations
      TEAM_PERMISSIONS.quotations.VIEW,
      TEAM_PERMISSIONS.quotations.CREATE,
      TEAM_PERMISSIONS.quotations.EDIT,
      TEAM_PERMISSIONS.quotations.SEND,
      
      // Analytics
      TEAM_PERMISSIONS.analytics.VIEW_DASHBOARD,
      TEAM_PERMISSIONS.analytics.VIEW_REPORTS,
      TEAM_PERMISSIONS.analytics.EXPORT_REPORTS,
      
      // Team Management
      TEAM_PERMISSIONS.team_management.VIEW_TEAMS,
      TEAM_PERMISSIONS.team_management.INVITE_MEMBERS,
    ],
  },
  SALES_REP: {
    name: "Sales Representative",
    description: "Manage own contacts, deals, and tasks",
    permissions: [
      // Contacts
      TEAM_PERMISSIONS.contacts.VIEW,
      TEAM_PERMISSIONS.contacts.CREATE,
      TEAM_PERMISSIONS.contacts.EDIT,
      
      // Companies
      TEAM_PERMISSIONS.companies.VIEW,
      TEAM_PERMISSIONS.companies.CREATE,
      TEAM_PERMISSIONS.companies.EDIT,
      
      // Deals
      TEAM_PERMISSIONS.deals.VIEW,
      TEAM_PERMISSIONS.deals.CREATE,
      TEAM_PERMISSIONS.deals.EDIT,
      TEAM_PERMISSIONS.deals.CHANGE_STAGE,
      
      // Tasks
      TEAM_PERMISSIONS.tasks.VIEW,
      TEAM_PERMISSIONS.tasks.CREATE,
      TEAM_PERMISSIONS.tasks.EDIT,
      TEAM_PERMISSIONS.tasks.COMPLETE,
      
      // Products
      TEAM_PERMISSIONS.products.VIEW,
      
      // Quotations
      TEAM_PERMISSIONS.quotations.VIEW,
      TEAM_PERMISSIONS.quotations.CREATE,
      TEAM_PERMISSIONS.quotations.EDIT,
      TEAM_PERMISSIONS.quotations.SEND,
      
      // Analytics
      TEAM_PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
  MARKETING: {
    name: "Marketing",
    description: "Manage marketing campaigns and content",
    permissions: [
      // Contacts
      TEAM_PERMISSIONS.contacts.VIEW,
      TEAM_PERMISSIONS.contacts.CREATE,
      TEAM_PERMISSIONS.contacts.EDIT,
      TEAM_PERMISSIONS.contacts.IMPORT,
      
      // Forms
      TEAM_PERMISSIONS.forms.VIEW,
      TEAM_PERMISSIONS.forms.CREATE,
      TEAM_PERMISSIONS.forms.EDIT,
      TEAM_PERMISSIONS.forms.DELETE,
      TEAM_PERMISSIONS.forms.VIEW_SUBMISSIONS,
      TEAM_PERMISSIONS.forms.MANAGE_ALL,
      
      // Email Campaigns
      TEAM_PERMISSIONS.email_campaigns.VIEW,
      TEAM_PERMISSIONS.email_campaigns.CREATE,
      TEAM_PERMISSIONS.email_campaigns.EDIT,
      TEAM_PERMISSIONS.email_campaigns.DELETE,
      TEAM_PERMISSIONS.email_campaigns.SEND,
      TEAM_PERMISSIONS.email_campaigns.MANAGE_ALL,
      
      // Landing Pages
      TEAM_PERMISSIONS.landing_pages.VIEW,
      TEAM_PERMISSIONS.landing_pages.CREATE,
      TEAM_PERMISSIONS.landing_pages.EDIT,
      TEAM_PERMISSIONS.landing_pages.DELETE,
      TEAM_PERMISSIONS.landing_pages.PUBLISH,
      TEAM_PERMISSIONS.landing_pages.MANAGE_ALL,
      
      // Analytics
      TEAM_PERMISSIONS.analytics.VIEW_DASHBOARD,
      TEAM_PERMISSIONS.analytics.VIEW_REPORTS,
    ],
  },
  SUPPORT: {
    name: "Support",
    description: "View and assist with customer issues",
    permissions: [
      // Contacts
      TEAM_PERMISSIONS.contacts.VIEW,
      TEAM_PERMISSIONS.contacts.EDIT,
      
      // Companies
      TEAM_PERMISSIONS.companies.VIEW,
      
      // Deals
      TEAM_PERMISSIONS.deals.VIEW,
      
      // Tasks
      TEAM_PERMISSIONS.tasks.VIEW,
      TEAM_PERMISSIONS.tasks.CREATE,
      TEAM_PERMISSIONS.tasks.EDIT,
      TEAM_PERMISSIONS.tasks.COMPLETE,
      
      // Invoices
      TEAM_PERMISSIONS.invoices.VIEW,
      
      // Analytics
      TEAM_PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access",
    permissions: [
      TEAM_PERMISSIONS.contacts.VIEW,
      TEAM_PERMISSIONS.companies.VIEW,
      TEAM_PERMISSIONS.deals.VIEW,
      TEAM_PERMISSIONS.tasks.VIEW,
      TEAM_PERMISSIONS.products.VIEW,
      TEAM_PERMISSIONS.invoices.VIEW,
      TEAM_PERMISSIONS.quotations.VIEW,
      TEAM_PERMISSIONS.analytics.VIEW_DASHBOARD,
    ],
  },
};

// Helper function to check team permissions
export function hasTeamPermission(
  userPermissions: string[] | null | undefined,
  requiredPermission: string
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
}

// Helper function to check multiple permissions (AND)
export function hasAllTeamPermissions(
  userPermissions: string[] | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}

// Helper function to check multiple permissions (OR)
export function hasAnyTeamPermission(
  userPermissions: string[] | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
}

// Type for all possible permission values
export type TeamPermissionValue = typeof TEAM_PERMISSIONS[keyof typeof TEAM_PERMISSIONS][keyof typeof TEAM_PERMISSIONS[keyof typeof TEAM_PERMISSIONS]];

// Get all permissions flat list
export function getAllTeamPermissions(): Array<{
  name: string;
  category: string;
  description: string;
}> {
  const allPermissions: Array<{
    name: string;
    category: string;
    description: string;
  }> = [];
  
  Object.entries(TEAM_PERMISSIONS).forEach(([category, permissions]) => {
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
export function getTeamPermissionsByCategory(category: string): Record<string, string> {
  return TEAM_PERMISSIONS[category as keyof typeof TEAM_PERMISSIONS] || {};
}

// Permission group structure for UI
export const TEAM_PERMISSION_GROUPS = [
  {
    title: "CRM",
    categories: [
      TEAM_PERMISSION_CATEGORIES.CONTACTS,
      TEAM_PERMISSION_CATEGORIES.COMPANIES,
      TEAM_PERMISSION_CATEGORIES.DEALS,
      TEAM_PERMISSION_CATEGORIES.TASKS,
    ],
  },
  {
    title: "Sales",
    categories: [
      TEAM_PERMISSION_CATEGORIES.PRODUCTS,
      TEAM_PERMISSION_CATEGORIES.INVOICES,
      TEAM_PERMISSION_CATEGORIES.QUOTATIONS,
    ],
  },
  {
    title: "Marketing",
    categories: [
      TEAM_PERMISSION_CATEGORIES.EMAIL_CAMPAIGNS,
      TEAM_PERMISSION_CATEGORIES.FORMS,
      TEAM_PERMISSION_CATEGORIES.LANDING_PAGES,
    ],
  },
  {
    title: "Automation",
    categories: [
      TEAM_PERMISSION_CATEGORIES.WORKFLOWS,
    ],
  },
  {
    title: "Management",
    categories: [
      TEAM_PERMISSION_CATEGORIES.ANALYTICS,
      TEAM_PERMISSION_CATEGORIES.SETTINGS,
      TEAM_PERMISSION_CATEGORIES.TEAM_MANAGEMENT,
      TEAM_PERMISSION_CATEGORIES.BILLING,
    ],
  },
]; 