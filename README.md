# CRM Pro - Complete Multi-Tenant CRM System

A professional, enterprise-grade CRM system with subscription management, multi-tenant architecture, and advanced plan limits enforcement. Built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## 🚀 Key Features

### **Subscription Management**
- ✅ **4 Subscription Tiers**: FREE, NORMAL, PREMIUM, ENTERPRISE
- ✅ **Real-time Usage Tracking**: Contacts, deals, companies, users
- ✅ **Plan Limit Enforcement**: Automatic blocking when limits reached
- ✅ **Professional Billing Interface**: Usage visualization with upgrade prompts
- ✅ **Stripe-Ready**: Demo mode functional, production-ready architecture

### **Multi-Tenant Architecture**
- ✅ **Complete Data Isolation**: Each tenant has isolated data
- ✅ **Role-Based Access Control**: 7 roles (SUPER_ADMIN, TENANT_ADMIN, MANAGER, MARKETER, SALES, SUPPORT, USER)
- ✅ **Plan-Based Feature Access**: Features enabled/disabled by subscription tier
- ✅ **Usage Percentage Tracking**: Color-coded usage indicators

### **CRM Core Features**
- ✅ **Contact Management**: Create, edit, track contacts with plan limits
- ✅ **Company Management**: Full company profiles and relationships
- ✅ **Deal Pipeline**: Sales pipeline with stages and probability tracking
- ✅ **Form Builder**: Dynamic form creation with submissions
- ✅ **Kanban Board**: Visual deal pipeline management
- ✅ **Analytics & Reporting**: Usage statistics and business intelligence

### **Super Admin Platform**
- ✅ **Plan Management**: Create, edit, activate/deactivate plans
- ✅ **Usage Monitoring**: Real-time tenant usage across platform
- ✅ **Subscription Control**: Full platform management capabilities
- ✅ **Multi-Plan Architecture**: Flexible plan configuration system

## 🔑 Quick Start Credentials

### **Super Admin Access**
```
Email: admin@crm-system.com
Password: superadmin123
Features: Full platform management, plan creation, system analytics
Access: /admin/plans, /admin/users, /admin/tenants, /admin/analytics
```

### **Demo Tenant User**
```
Email: demo@sample-company.com
Password: password123
Features: Full CRM access within plan limits
Tenant: Sample Company (FREE plan)
```

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (Optional - for production)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Setup database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed plans (creates 4 subscription tiers)
npx ts-node scripts/seed-plans.ts

# Seed super admin user
npx ts-node scripts/seed-super-admin.ts

# Seed demo data (optional)
npx ts-node scripts/seed-sample-data.ts
```

### 3. Start Development

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## 📊 Subscription Plans

| Plan | Price | Contacts | Deals | Companies | Users | Features |
|------|-------|----------|-------|-----------|-------|----------|
| **FREE** | $0/month | 100 | 50 | 25 | 1 | Basic CRM |
| **NORMAL** | $29/month | 2,500 | 1,000 | 500 | 3 | Forms + Reports |
| **PREMIUM** | $59/month | 10,000 | 5,000 | 2,000 | 10 | Advanced Features |
| **ENTERPRISE** | $119/month | Unlimited | Unlimited | Unlimited | Unlimited | All Features |

## 🎯 How to Use the System

### **For Super Admins**

1. **Login** with super admin credentials
2. **Navigate to** `/admin/plans` to manage subscription plans
3. **Create/Edit Plans** with custom limits and features
4. **Monitor Usage** across all tenants
5. **Manage Platform** settings and configurations

### **For Tenant Users**

1. **Login** with tenant credentials
2. **Check Current Plan** in sidebar or `/dashboard/billing`
3. **Create Contacts/Companies/Deals** within plan limits
4. **Monitor Usage** with real-time percentage indicators
5. **Upgrade Plan** when limits are reached via billing page

### **Plan Limit Enforcement**

- ✅ **Real-time Checking**: Limits checked before creating resources
- ✅ **Graceful Blocking**: 402 Payment Required when limits exceeded
- ✅ **Upgrade Prompts**: Direct links to billing/upgrade flows
- ✅ **Usage Visualization**: Color-coded progress bars (green/yellow/red)

## 🏗️ System Architecture

### **Core Technologies**
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with full ACID compliance
- **Authentication**: NextAuth.js with role-based access
- **UI Components**: Hero Icons, React Hot Toast
- **Payment**: Stripe-ready architecture (demo mode available)

### **Key Components**

```
app/
├── admin/                    # Super admin interfaces
│   └── plans/               # Plan management system
├── dashboard/               # Main CRM interface
│   ├── billing/            # Billing and plan management
│   ├── contacts/           # Contact management
│   ├── companies/          # Company management
│   ├── deals/              # Deal pipeline
│   └── form-builder/       # Dynamic form creation
├── api/
│   ├── admin/              # Super admin APIs
│   ├── billing/            # Billing and plan APIs
│   ├── contacts/           # Contact management APIs
│   ├── companies/          # Company management APIs
│   └── deals/              # Deal management APIs
└── lib/
    ├── plan-limits.ts      # Plan enforcement logic
    ├── permissions.ts      # Role-based access control
    └── prisma.ts          # Database client
```

## 🔐 Security Features

- ✅ **Multi-tenant Data Isolation**: Complete data separation
- ✅ **Role-based Permissions**: 7-tier access control system
- ✅ **Session Security**: Secure authentication with NextAuth
- ✅ **Plan Limit Enforcement**: Prevents resource overconsumption
- ✅ **Input Validation**: Comprehensive data validation
- ✅ **CSRF Protection**: Built-in security measures

## 📈 Business Intelligence

### **Usage Tracking**
- Real-time resource counting (contacts, deals, companies, users)
- Percentage-based usage visualization
- Color-coded warning system (75% = yellow, 90% = red)
- Historical usage patterns (ready for implementation)

### **Plan Analytics**
- Subscription revenue tracking
- Feature usage statistics
- Tenant engagement metrics
- Upgrade conversion tracking

## 🚀 Production Deployment

### **Database**
1. Set up PostgreSQL (Supabase, Railway, or managed service)
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma db push`

### **Application**
1. Deploy to Vercel/Netlify/similar platform
2. Configure environment variables
3. Set up custom domain and SSL

### **Stripe Integration** (Optional)
1. Create Stripe account and products
2. Configure webhook endpoints
3. Update environment variables with live keys

## 🛣️ Roadmap & Next Steps

### **Immediate Enhancements**
- [ ] **Real Stripe Integration**: Complete payment processing
- [ ] **Email Notifications**: Billing and usage alerts
- [ ] **Advanced Analytics**: Revenue and usage dashboards
- [ ] **Team Management**: Multi-user tenant administration

### **Advanced Features**
- [ ] **API Access**: RESTful API for integrations
- [ ] **Custom Domains**: White-label tenant options
- [ ] **Advanced Automations**: Workflow triggers and actions
- [ ] **Mobile App**: React Native companion app

### **Enterprise Features**
- [ ] **SSO Integration**: SAML/OAuth enterprise login
- [ ] **Advanced Security**: IP restrictions, audit logs
- [ ] **Custom Integrations**: Zapier, Webhook automations
- [ ] **Multi-language Support**: Internationalization

## 🆘 Support & Troubleshooting

### **Common Issues**

1. **Database Connection**: Ensure PostgreSQL is running and URL is correct
2. **Migration Errors**: Run `npx prisma db push` to sync schema
3. **Authentication Issues**: Check NextAuth configuration and secrets
4. **Plan Limits**: Verify plan seeding completed successfully

### **Debug Mode**
```bash
# Enable Prisma query logging
DEBUG=prisma:query npm run dev

# Enable detailed error logging
NODE_ENV=development npm run dev
```

### **Access Levels**

| Role | Access | Features |
|------|--------|----------|
| **SUPER_ADMIN** | Platform-wide | All admin features |
| **TENANT_ADMIN** | Tenant-wide | Full tenant management |
| **MANAGER** | Advanced | Reports, team features |
| **MARKETER** | Marketing | Forms, campaigns |
| **SALES** | Sales | Deals, pipeline |
| **SUPPORT** | Support | Contact assistance |
| **USER** | Basic | Limited CRM access |

---

**CRM Pro** - Enterprise-grade customer relationship management with intelligent subscription management. 🚀

For technical support or feature requests, please check the documentation or contact the development team.
