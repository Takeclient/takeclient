export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'CRM' | 'Marketing' | 'Sales' | 'Ecommerce' | 'General';
  icon: string;
  color: string;
  isPremium?: boolean;
  triggerType: string;
  triggerConfig: any;
  actions: Array<{
    type: string;
    name: string;
    config: any;
    order: number;
    delayMinutes?: number;
  }>;
  tags: string[];
  estimatedTime?: string;
  benefits?: string[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  // CRM Templates
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing Campaign',
    description: 'Automatically nurture new leads with a series of personalized emails and tasks',
    category: 'CRM',
    icon: '🎯',
    color: '#3B82F6',
    triggerType: 'CONTACT_CREATED',
    triggerConfig: {
      filterBySource: true,
      sources: ['website', 'form'],
    },
    actions: [
      {
        type: 'SEND_EMAIL',
        name: 'Send Welcome Email',
        config: {
          templateId: 'welcome-email',
          subject: 'Welcome to {{company.name}}!',
          personalize: true,
        },
        order: 1,
      },
      {
        type: 'WAIT',
        name: 'Wait 2 Days',
        config: {
          delay: 2,
          unit: 'days',
        },
        order: 2,
      },
      {
        type: 'UPDATE_CONTACT_SCORE',
        name: 'Increase Lead Score',
        config: {
          operation: 'add',
          value: 10,
        },
        order: 3,
      },
      {
        type: 'SEND_EMAIL',
        name: 'Send Educational Content',
        config: {
          templateId: 'educational-content',
          subject: '5 Tips to Improve Your Business',
          trackOpens: true,
          trackClicks: true,
        },
        order: 4,
      },
      {
        type: 'CREATE_TASK',
        name: 'Follow-up Call',
        config: {
          title: 'Call new lead {{contact.firstName}}',
          dueInDays: 3,
          priority: 'medium',
          assignToTeam: 'sales',
        },
        order: 5,
      },
    ],
    tags: ['lead-generation', 'email-marketing', 'automation'],
    estimatedTime: '5 days',
    benefits: ['Increase lead engagement by 40%', 'Save 2 hours per lead', 'Improve conversion rates'],
  },
  {
    id: 'deal-follow-up',
    name: 'Deal Follow-up Automation',
    description: 'Automatically follow up on deals based on their stage and activity',
    category: 'CRM',
    icon: '💰',
    color: '#8B5CF6',
    triggerType: 'DEAL_STAGE_CHANGED',
    triggerConfig: {
      stages: ['proposal', 'negotiation'],
    },
    actions: [
      {
        type: 'BRANCH_CONDITION',
        name: 'Check Deal Value',
        config: {
          conditions: [
            {
              field: 'deal.value',
              operator: 'greater_than',
              value: 10000,
              actions: ['high-value-actions'],
            },
            {
              field: 'deal.value',
              operator: 'less_than_or_equal',
              value: 10000,
              actions: ['standard-actions'],
            },
          ],
        },
        order: 1,
      },
      {
        type: 'SEND_NOTIFICATION',
        name: 'Notify Sales Manager',
        config: {
          recipientRole: 'sales_manager',
          message: 'High-value deal {{deal.name}} moved to {{deal.stage}}',
          channels: ['email', 'in-app'],
        },
        order: 2,
      },
      {
        type: 'CREATE_ACTIVITY',
        name: 'Log Stage Change',
        config: {
          type: 'deal_update',
          description: 'Deal moved to {{deal.stage}} stage',
        },
        order: 3,
      },
    ],
    tags: ['sales', 'deal-management', 'notifications'],
    estimatedTime: 'Instant',
    benefits: ['Never miss a deal update', 'Faster response times', 'Better team coordination'],
  },

  // Marketing Templates
  {
    id: 'email-campaign-automation',
    name: 'Smart Email Campaign',
    description: 'Send targeted email campaigns based on customer behavior and engagement',
    category: 'Marketing',
    icon: '📧',
    color: '#10B981',
    triggerType: 'CONTACT_TAG_ADDED',
    triggerConfig: {
      tags: ['email-subscriber', 'newsletter'],
    },
    actions: [
      {
        type: 'ADD_TO_EMAIL_LIST',
        name: 'Add to Campaign List',
        config: {
          listId: 'marketing-campaigns',
          confirmOptIn: true,
        },
        order: 1,
      },
      {
        type: 'SEND_EMAIL',
        name: 'Send Campaign Email 1',
        config: {
          templateId: 'campaign-email-1',
          subject: 'Exclusive Offer Just for You!',
          abTesting: {
            enabled: true,
            variants: ['version-a', 'version-b'],
          },
        },
        order: 2,
      },
      {
        type: 'WAIT',
        name: 'Wait for Engagement',
        config: {
          delay: 3,
          unit: 'days',
        },
        order: 3,
      },
      {
        type: 'BRANCH_CONDITION',
        name: 'Check Email Engagement',
        config: {
          conditions: [
            {
              field: 'email.opened',
              operator: 'equals',
              value: true,
              nextAction: 'engaged-path',
            },
            {
              field: 'email.opened',
              operator: 'equals',
              value: false,
              nextAction: 're-engagement-path',
            },
          ],
        },
        order: 4,
      },
    ],
    tags: ['email-marketing', 'campaigns', 'engagement'],
    estimatedTime: '7-14 days',
    benefits: ['60% higher open rates', 'Personalized customer journey', 'Automated A/B testing'],
  },
  {
    id: 'social-media-lead-capture',
    name: 'Social Media Lead Capture',
    description: 'Capture and nurture leads from social media campaigns',
    category: 'Marketing',
    icon: '📱',
    color: '#F59E0B',
    triggerType: 'FORM_SUBMITTED',
    triggerConfig: {
      formTypes: ['social-media', 'landing-page'],
      utmSource: ['facebook', 'instagram', 'linkedin'],
    },
    actions: [
      {
        type: 'UPDATE_CONTACT',
        name: 'Tag Social Source',
        config: {
          addTags: ['social-media-lead', '{{form.utm_source}}'],
          updateFields: {
            leadSource: '{{form.utm_source}}',
            campaignId: '{{form.utm_campaign}}',
          },
        },
        order: 1,
      },
      {
        type: 'SEND_WHATSAPP',
        name: 'Send WhatsApp Welcome',
        config: {
          templateId: 'social-welcome',
          mediaUrl: '{{company.logo}}',
          quickReplies: ['Learn More', 'Schedule Demo', 'Contact Sales'],
        },
        order: 2,
      },
      {
        type: 'UPDATE_CONTACT_SCORE',
        name: 'Score Based on Source',
        config: {
          scoreRules: {
            facebook: 15,
            instagram: 20,
            linkedin: 25,
          },
        },
        order: 3,
      },
    ],
    tags: ['social-media', 'lead-capture', 'multi-channel'],
    estimatedTime: 'Instant',
    benefits: ['Instant lead response', 'Multi-channel engagement', 'Source-based scoring'],
  },

  // Sales Templates
  {
    id: 'sales-pipeline-automation',
    name: 'Sales Pipeline Automation',
    description: 'Automate your entire sales pipeline from lead to close',
    category: 'Sales',
    icon: '📈',
    color: '#EF4444',
    triggerType: 'CONTACT_STAGE_CHANGED',
    triggerConfig: {
      stages: ['qualified', 'demo-scheduled', 'proposal'],
    },
    actions: [
      {
        type: 'BRANCH_CONDITION',
        name: 'Route by Stage',
        config: {
          conditions: [
            {
              field: 'contact.stage',
              operator: 'equals',
              value: 'qualified',
              nextAction: 'qualified-actions',
            },
            {
              field: 'contact.stage',
              operator: 'equals',
              value: 'demo-scheduled',
              nextAction: 'demo-actions',
            },
            {
              field: 'contact.stage',
              operator: 'equals',
              value: 'proposal',
              nextAction: 'proposal-actions',
            },
          ],
        },
        order: 1,
      },
      {
        type: 'CREATE_DEAL',
        name: 'Create Sales Opportunity',
        config: {
          dealName: 'Opportunity - {{contact.company}}',
          estimatedValue: '{{contact.estimatedDealSize}}',
          probability: {
            qualified: 20,
            'demo-scheduled': 40,
            proposal: 60,
          },
        },
        order: 2,
      },
      {
        type: 'ASSIGN_CONTACT',
        name: 'Assign to Sales Rep',
        config: {
          assignmentRule: 'round-robin',
          team: 'sales',
          notifyAssignee: true,
        },
        order: 3,
      },
      {
        type: 'CREATE_TASK',
        name: 'Create Follow-up Task',
        config: {
          taskTemplates: {
            qualified: 'Initial qualifying call',
            'demo-scheduled': 'Prepare and conduct demo',
            proposal: 'Send proposal and follow up',
          },
        },
        order: 4,
      },
    ],
    tags: ['sales-pipeline', 'opportunity-management', 'automation'],
    estimatedTime: 'Throughout sales cycle',
    benefits: ['50% faster sales cycle', 'No missed follow-ups', 'Consistent sales process'],
  },
  {
    id: 'quote-follow-up',
    name: 'Quotation Follow-up Sequence',
    description: 'Automatically follow up on sent quotations to increase close rates',
    category: 'Sales',
    icon: '📄',
    color: '#06B6D4',
    triggerType: 'QUOTATION_SENT',
    triggerConfig: {
      minValue: 1000,
    },
    actions: [
      {
        type: 'WAIT',
        name: 'Wait 2 Days',
        config: {
          delay: 2,
          unit: 'days',
        },
        order: 1,
      },
      {
        type: 'SEND_EMAIL',
        name: 'First Follow-up',
        config: {
          templateId: 'quote-follow-up-1',
          subject: 'Quick question about your quotation',
          personalization: ['quote.number', 'quote.total', 'contact.firstName'],
        },
        order: 2,
      },
      {
        type: 'WAIT',
        name: 'Wait 3 More Days',
        config: {
          delay: 3,
          unit: 'days',
        },
        order: 3,
      },
      {
        type: 'BRANCH_CONDITION',
        name: 'Check Quote Status',
        config: {
          conditions: [
            {
              field: 'quotation.status',
              operator: 'equals',
              value: 'viewed',
              nextAction: 'viewed-actions',
            },
            {
              field: 'quotation.status',
              operator: 'equals',
              value: 'sent',
              nextAction: 'not-viewed-actions',
            },
          ],
        },
        order: 4,
      },
      {
        type: 'CREATE_TASK',
        name: 'Call Prospect',
        config: {
          title: 'Call about quote {{quotation.number}}',
          priority: 'high',
          description: 'Quote value: {{quotation.total}}',
        },
        order: 5,
      },
    ],
    tags: ['sales', 'quotations', 'follow-up'],
    estimatedTime: '5-7 days',
    benefits: ['30% higher quote conversion', 'Timely follow-ups', 'Prioritized sales actions'],
  },

  // Ecommerce Templates
  {
    id: 'abandoned-cart-recovery',
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with automated abandoned cart reminders',
    category: 'Ecommerce',
    icon: '🛒',
    color: '#84CC16',
    triggerType: 'CART_ABANDONED',
    triggerConfig: {
      minCartValue: 50,
      waitTime: 60, // minutes
    },
    actions: [
      {
        type: 'WAIT',
        name: 'Wait 1 Hour',
        config: {
          delay: 1,
          unit: 'hours',
        },
        order: 1,
      },
      {
        type: 'SEND_EMAIL',
        name: 'Cart Reminder Email',
        config: {
          templateId: 'abandoned-cart-1',
          subject: 'You left something behind!',
          includeCartItems: true,
          includeCoupon: {
            enabled: true,
            discountPercent: 10,
            validHours: 24,
          },
        },
        order: 2,
      },
      {
        type: 'WAIT',
        name: 'Wait 24 Hours',
        config: {
          delay: 24,
          unit: 'hours',
        },
        order: 3,
      },
      {
        type: 'BRANCH_CONDITION',
        name: 'Check if Purchased',
        config: {
          conditions: [
            {
              field: 'order.completed',
              operator: 'equals',
              value: true,
              nextAction: 'stop',
            },
            {
              field: 'order.completed',
              operator: 'equals',
              value: false,
              nextAction: 'continue',
            },
          ],
        },
        order: 4,
      },
      {
        type: 'SEND_WHATSAPP',
        name: 'WhatsApp Reminder',
        config: {
          templateId: 'cart-reminder-whatsapp',
          includeCartLink: true,
          includeCoupon: true,
        },
        order: 5,
      },
    ],
    tags: ['ecommerce', 'cart-recovery', 'revenue-optimization'],
    estimatedTime: '48 hours',
    benefits: ['Recover 25% of abandoned carts', 'Automated discounts', 'Multi-channel reminders'],
  },
  {
    id: 'post-purchase-experience',
    name: 'Post-Purchase Experience',
    description: 'Delight customers after purchase with reviews, upsells, and loyalty rewards',
    category: 'Ecommerce',
    icon: '🎁',
    color: '#EC4899',
    triggerType: 'ORDER_COMPLETED',
    triggerConfig: {
      orderTypes: ['online', 'in-store'],
    },
    actions: [
      {
        type: 'SEND_EMAIL',
        name: 'Order Confirmation',
        config: {
          templateId: 'order-confirmation',
          includeInvoice: true,
          trackingInfo: true,
        },
        order: 1,
      },
      {
        type: 'UPDATE_CONTACT',
        name: 'Update Customer Status',
        config: {
          addTags: ['customer', 'purchased'],
          updateFields: {
            lifetimeValue: '{{add contact.lifetimeValue order.total}}',
            lastPurchaseDate: '{{now}}',
            totalOrders: '{{add contact.totalOrders 1}}',
          },
        },
        order: 2,
      },
      {
        type: 'WAIT',
        name: 'Wait 7 Days',
        config: {
          delay: 7,
          unit: 'days',
        },
        order: 3,
      },
      {
        type: 'SEND_EMAIL',
        name: 'Request Review',
        config: {
          templateId: 'review-request',
          subject: 'How was your experience with {{order.items[0].name}}?',
          includeReviewLinks: true,
          incentive: {
            enabled: true,
            type: 'loyalty-points',
            value: 100,
          },
        },
        order: 4,
      },
      {
        type: 'BRANCH_CONDITION',
        name: 'Check Order Value',
        config: {
          conditions: [
            {
              field: 'order.total',
              operator: 'greater_than',
              value: 200,
              nextAction: 'vip-treatment',
            },
          ],
        },
        order: 5,
      },
      {
        type: 'ADD_TO_EMAIL_LIST',
        name: 'Add to VIP List',
        config: {
          listId: 'vip-customers',
          tags: ['high-value', 'vip'],
        },
        order: 6,
      },
    ],
    tags: ['ecommerce', 'customer-experience', 'loyalty'],
    estimatedTime: '30 days',
    benefits: ['80% review collection rate', 'Increased customer LTV', 'Better customer retention'],
  },
  {
    id: 'inventory-alert-automation',
    name: 'Inventory Management Alerts',
    description: 'Automate inventory alerts and reorder processes',
    category: 'Ecommerce',
    icon: '📦',
    color: '#0EA5E9',
    triggerType: 'INVENTORY_LOW',
    triggerConfig: {
      threshold: 20,
      checkFrequency: 'daily',
    },
    actions: [
      {
        type: 'SEND_NOTIFICATION',
        name: 'Alert Inventory Manager',
        config: {
          recipients: ['inventory-manager', 'operations'],
          urgency: {
            critical: 'stock < 5',
            high: 'stock < 10',
            medium: 'stock < 20',
          },
          channels: ['email', 'sms', 'in-app'],
        },
        order: 1,
      },
      {
        type: 'CREATE_TASK',
        name: 'Create Reorder Task',
        config: {
          title: 'Reorder {{product.name}} - Stock: {{product.currentStock}}',
          assignTo: 'purchasing-team',
          priority: 'high',
          includeSupplierInfo: true,
        },
        order: 2,
      },
      {
        type: 'UPDATE_PRODUCT',
        name: 'Update Product Status',
        config: {
          fields: {
            stockStatus: 'low',
            lastAlertDate: '{{now}}',
          },
          notifySubscribers: true,
        },
        order: 3,
      },
      {
        type: 'BRANCH_CONDITION',
        name: 'Check if Bestseller',
        config: {
          conditions: [
            {
              field: 'product.tags',
              operator: 'contains',
              value: 'bestseller',
              nextAction: 'urgent-reorder',
            },
          ],
        },
        order: 4,
      },
      {
        type: 'API_REQUEST',
        name: 'Auto-Create Purchase Order',
        config: {
          endpoint: '/api/purchase-orders',
          method: 'POST',
          body: {
            productId: '{{product.id}}',
            quantity: '{{product.reorderQuantity}}',
            supplierId: '{{product.preferredSupplier}}',
            priority: 'urgent',
          },
        },
        order: 5,
      },
    ],
    tags: ['inventory', 'operations', 'automation'],
    estimatedTime: 'Instant',
    benefits: ['Never run out of stock', 'Automated reordering', 'Proactive inventory management'],
  },
];

// Enhanced trigger and action configurations
export const enhancedTriggers = {
  // CRM Triggers
  CRM: [
    {
      value: 'CONTACT_CREATED',
      label: 'Contact Created',
      icon: '👤',
      description: 'When a new contact is added',
      config: {
        filters: ['source', 'tags', 'assignedTo', 'customFields'],
      },
    },
    {
      value: 'CONTACT_UPDATED',
      label: 'Contact Updated',
      icon: '✏️',
      description: 'When contact details are changed',
      config: {
        watchFields: ['email', 'phone', 'stage', 'score', 'tags'],
        filters: ['specificFields', 'oldValue', 'newValue'],
      },
    },
    {
      value: 'CONTACT_STAGE_CHANGED',
      label: 'Stage Changed',
      icon: '🔄',
      description: 'When contact moves to a new stage',
      config: {
        stages: ['lead', 'qualified', 'opportunity', 'customer'],
        direction: ['forward', 'backward', 'any'],
      },
    },
    {
      value: 'DEAL_CREATED',
      label: 'Deal Created',
      icon: '💰',
      description: 'When a new deal is created',
      config: {
        filters: ['value', 'stage', 'assignedTo', 'product'],
      },
    },
    {
      value: 'ACTIVITY_COMPLETED',
      label: 'Activity Completed',
      icon: '✅',
      description: 'When an activity is marked complete',
      config: {
        activityTypes: ['call', 'email', 'meeting', 'task'],
        outcomes: ['successful', 'unsuccessful', 'rescheduled'],
      },
    },
  ],

  // Marketing Triggers
  Marketing: [
    {
      value: 'EMAIL_OPENED',
      label: 'Email Opened',
      icon: '📧',
      description: 'When an email is opened',
      config: {
        campaigns: ['specific', 'any'],
        deviceTypes: ['desktop', 'mobile'],
        openCount: ['first', 'multiple'],
      },
    },
    {
      value: 'EMAIL_CLICKED',
      label: 'Link Clicked',
      icon: '🔗',
      description: 'When a link in email is clicked',
      config: {
        links: ['specific', 'any', 'cta'],
        clickCount: ['first', 'multiple'],
      },
    },
    {
      value: 'FORM_SUBMITTED',
      label: 'Form Submitted',
      icon: '📝',
      description: 'When someone submits a form',
      config: {
        forms: ['contact', 'demo', 'newsletter', 'custom'],
        fields: ['email', 'phone', 'company'],
        scoring: true,
      },
    },
    {
      value: 'CAMPAIGN_JOINED',
      label: 'Campaign Joined',
      icon: '🎯',
      description: 'When contact joins a campaign',
      config: {
        campaignTypes: ['email', 'sms', 'social'],
        entryMethod: ['manual', 'automatic', 'import'],
      },
    },
    {
      value: 'WEBSITE_VISIT',
      label: 'Website Visit',
      icon: '🌐',
      description: 'When contact visits website',
      config: {
        pages: ['specific', 'any'],
        visitCount: ['first', 'returning'],
        duration: ['seconds', 'minutes'],
      },
    },
  ],

  // Sales Triggers
  Sales: [
    {
      value: 'QUOTATION_SENT',
      label: 'Quotation Sent',
      icon: '📄',
      description: 'When a quotation is sent',
      config: {
        valueRange: ['min', 'max'],
        products: ['specific', 'category'],
        validity: ['days'],
      },
    },
    {
      value: 'QUOTATION_VIEWED',
      label: 'Quotation Viewed',
      icon: '👁️',
      description: 'When quotation is viewed by customer',
      config: {
        viewCount: ['first', 'multiple'],
        timeSpent: ['seconds', 'minutes'],
      },
    },
    {
      value: 'INVOICE_OVERDUE',
      label: 'Invoice Overdue',
      icon: '⚠️',
      description: 'When invoice becomes overdue',
      config: {
        daysOverdue: [1, 7, 15, 30],
        amountRange: ['min', 'max'],
        customerType: ['new', 'existing', 'vip'],
      },
    },
    {
      value: 'PAYMENT_RECEIVED',
      label: 'Payment Received',
      icon: '💳',
      description: 'When payment is received',
      config: {
        paymentMethods: ['card', 'bank', 'cash'],
        amount: ['full', 'partial'],
        invoice: ['specific', 'any'],
      },
    },
    {
      value: 'CONTRACT_EXPIRING',
      label: 'Contract Expiring',
      icon: '📅',
      description: 'When contract is near expiration',
      config: {
        daysBefore: [30, 60, 90],
        contractType: ['service', 'subscription', 'license'],
        autoRenew: ['yes', 'no'],
      },
    },
  ],

  // Ecommerce Triggers
  Ecommerce: [
    {
      value: 'ORDER_PLACED',
      label: 'Order Placed',
      icon: '🛍️',
      description: 'When a new order is placed',
      config: {
        orderValue: ['min', 'max'],
        products: ['specific', 'category', 'brand'],
        customerType: ['new', 'returning', 'vip'],
      },
    },
    {
      value: 'CART_ABANDONED',
      label: 'Cart Abandoned',
      icon: '🛒',
      description: 'When cart is abandoned',
      config: {
        cartValue: ['min', 'max'],
        waitTime: ['minutes', 'hours'],
        items: ['specific', 'category'],
      },
    },
    {
      value: 'PRODUCT_VIEWED',
      label: 'Product Viewed',
      icon: '👁️',
      description: 'When product is viewed',
      config: {
        products: ['specific', 'category', 'price-range'],
        viewCount: ['first', 'multiple'],
        viewDuration: ['seconds'],
      },
    },
    {
      value: 'INVENTORY_LOW',
      label: 'Low Inventory',
      icon: '📦',
      description: 'When inventory falls below threshold',
      config: {
        threshold: ['percentage', 'quantity'],
        products: ['specific', 'category', 'supplier'],
        urgency: ['low', 'medium', 'high'],
      },
    },
    {
      value: 'REVIEW_SUBMITTED',
      label: 'Review Submitted',
      icon: '⭐',
      description: 'When customer submits a review',
      config: {
        rating: [1, 2, 3, 4, 5],
        productType: ['specific', 'category'],
        verified: ['yes', 'no'],
      },
    },
  ],
};

// Enhanced action configurations
export const enhancedActions = {
  // CRM Actions
  CRM: [
    {
      value: 'UPDATE_CONTACT',
      label: 'Update Contact',
      icon: '✏️',
      description: 'Update contact information',
      color: '#3B82F6',
      category: 'CRM',
      config: {
        updateTypes: ['fields', 'tags', 'customFields', 'score'],
        operations: ['set', 'append', 'increment', 'decrement'],
      },
    },
    {
      value: 'CREATE_DEAL',
      label: 'Create Deal',
      icon: '💰',
      description: 'Create a new deal',
      color: '#8B5CF6',
      category: 'CRM',
      config: {
        dealFields: ['name', 'value', 'stage', 'probability', 'closeDate'],
        assignment: ['owner', 'team', 'round-robin'],
      },
    },
    {
      value: 'CREATE_TASK',
      label: 'Create Task',
      icon: '✅',
      description: 'Create a task',
      color: '#06B6D4',
      category: 'CRM',
      config: {
        taskTypes: ['call', 'email', 'meeting', 'follow-up'],
        priority: ['low', 'medium', 'high', 'urgent'],
        assignment: ['user', 'team', 'role'],
      },
    },
    {
      value: 'ASSIGN_OWNER',
      label: 'Assign Owner',
      icon: '👥',
      description: 'Change record owner',
      color: '#F59E0B',
      category: 'CRM',
      config: {
        assignmentRules: ['round-robin', 'load-balanced', 'territory', 'skill-based'],
        entityTypes: ['contact', 'deal', 'company'],
      },
    },
  ],

  // Marketing Actions
  Marketing: [
    {
      value: 'SEND_EMAIL',
      label: 'Send Email',
      icon: '📧',
      description: 'Send marketing email',
      color: '#10B981',
      category: 'Marketing',
      config: {
        emailTypes: ['template', 'campaign', 'transactional'],
        personalization: ['merge-tags', 'dynamic-content', 'recommendations'],
        tracking: ['opens', 'clicks', 'conversions'],
      },
    },
    {
      value: 'ADD_TO_CAMPAIGN',
      label: 'Add to Campaign',
      icon: '🎯',
      description: 'Add to marketing campaign',
      color: '#8B5CF6',
      category: 'Marketing',
      config: {
        campaignTypes: ['email', 'sms', 'social', 'multi-channel'],
        entryPoint: ['start', 'specific-step'],
      },
    },
    {
      value: 'UPDATE_LEAD_SCORE',
      label: 'Update Lead Score',
      icon: '📊',
      description: 'Adjust lead scoring',
      color: '#F59E0B',
      category: 'Marketing',
      config: {
        scoreTypes: ['behavior', 'demographic', 'engagement', 'fit'],
        operations: ['add', 'subtract', 'multiply', 'set'],
      },
    },
    {
      value: 'SEND_SMS',
      label: 'Send SMS',
      icon: '💬',
      description: 'Send SMS message',
      color: '#06B6D4',
      category: 'Marketing',
      config: {
        messageTypes: ['promotional', 'transactional', 'reminder'],
        scheduling: ['immediate', 'scheduled', 'timezone-based'],
      },
    },
  ],

  // Sales Actions
  Sales: [
    {
      value: 'CREATE_QUOTATION',
      label: 'Create Quotation',
      icon: '📄',
      description: 'Generate quotation',
      color: '#8B5CF6',
      category: 'Sales',
      config: {
        templates: ['standard', 'custom', 'product-based'],
        validity: ['days', 'date'],
        approval: ['auto', 'manual'],
      },
    },
    {
      value: 'SEND_INVOICE',
      label: 'Send Invoice',
      icon: '🧾',
      description: 'Send invoice to customer',
      color: '#10B981',
      category: 'Sales',
      config: {
        invoiceTypes: ['standard', 'recurring', 'milestone'],
        paymentTerms: ['immediate', 'net-15', 'net-30', 'custom'],
        reminders: ['enabled', 'schedule'],
      },
    },
    {
      value: 'UPDATE_PIPELINE',
      label: 'Update Pipeline Stage',
      icon: '📈',
      description: 'Move deal in pipeline',
      color: '#F59E0B',
      category: 'Sales',
      config: {
        stages: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed'],
        validation: ['required-fields', 'approval'],
      },
    },
    {
      value: 'SCHEDULE_MEETING',
      label: 'Schedule Meeting',
      icon: '📅',
      description: 'Book a meeting',
      color: '#EF4444',
      category: 'Sales',
      config: {
        meetingTypes: ['demo', 'discovery', 'follow-up', 'closing'],
        duration: ['15min', '30min', '45min', '60min'],
        location: ['zoom', 'in-person', 'phone'],
      },
    },
  ],

  // Ecommerce Actions
  Ecommerce: [
    {
      value: 'APPLY_DISCOUNT',
      label: 'Apply Discount',
      icon: '🏷️',
      description: 'Apply discount code',
      color: '#10B981',
      category: 'Ecommerce',
      config: {
        discountTypes: ['percentage', 'fixed', 'free-shipping'],
        conditions: ['min-purchase', 'product-specific', 'customer-segment'],
        validity: ['hours', 'days', 'uses'],
      },
    },
    {
      value: 'UPDATE_INVENTORY',
      label: 'Update Inventory',
      icon: '📦',
      description: 'Adjust inventory levels',
      color: '#F59E0B',
      category: 'Ecommerce',
      config: {
        operations: ['add', 'subtract', 'set', 'reserve'],
        locations: ['warehouse', 'store', 'all'],
        alerts: ['low-stock', 'out-of-stock'],
      },
    },
    {
      value: 'CREATE_SHIPMENT',
      label: 'Create Shipment',
      icon: '🚚',
      description: 'Generate shipping label',
      color: '#3B82F6',
      category: 'Ecommerce',
      config: {
        carriers: ['fedex', 'ups', 'dhl', 'local'],
        services: ['standard', 'express', 'overnight'],
        tracking: ['email', 'sms'],
      },
    },
    {
      value: 'REQUEST_REVIEW',
      label: 'Request Review',
      icon: '⭐',
      description: 'Ask for product review',
      color: '#8B5CF6',
      category: 'Ecommerce',
      config: {
        timing: ['days-after-delivery', 'days-after-purchase'],
        channels: ['email', 'sms', 'in-app'],
        incentives: ['points', 'discount', 'none'],
      },
    },
  ],

  // Control Flow
  ControlFlow: [
    {
      value: 'WAIT',
      label: 'Wait/Delay',
      icon: '⏱️',
      description: 'Pause workflow execution',
      color: '#6B7280',
      category: 'ControlFlow',
      config: {
        waitTypes: ['time', 'date', 'event'],
        units: ['minutes', 'hours', 'days', 'weeks'],
      },
    },
    {
      value: 'BRANCH_CONDITION',
      label: 'If/Then Branch',
      icon: '🔀',
      description: 'Conditional branching',
      color: '#EC4899',
      category: 'ControlFlow',
      config: {
        conditionTypes: ['field-value', 'tag-exists', 'score-range', 'date-comparison'],
        operators: ['equals', 'not-equals', 'greater-than', 'less-than', 'contains'],
        logic: ['and', 'or'],
      },
    },
    {
      value: 'LOOP',
      label: 'Loop/Repeat',
      icon: '🔁',
      description: 'Repeat actions',
      color: '#8B5CF6',
      category: 'ControlFlow',
      config: {
        loopTypes: ['count', 'until-condition', 'for-each'],
        maxIterations: 100,
      },
    },
    {
      value: 'WEBHOOK',
      label: 'Call Webhook',
      icon: '🔗',
      description: 'Call external API',
      color: '#F59E0B',
      category: 'ControlFlow',
      config: {
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        authentication: ['none', 'api-key', 'oauth', 'basic'],
        retries: [0, 1, 3, 5],
      },
    },
  ],
}; 