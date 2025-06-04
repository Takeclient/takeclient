# Teams and Roles Management System

## Overview

The Teams and Roles Management System allows organizations to create teams, define custom roles with specific permissions, and manage team members effectively. This system is integrated with the billing/plan system to enforce limits based on subscription tiers.

## Database Schema

### Core Models

1. **Team**
   - Represents a team within a tenant/organization
   - Fields: id, name, description, isActive, tenantId, ownerId
   - Relationships: belongs to Tenant, has many TeamMembers

2. **TeamMember**
   - Represents a user's membership in a team
   - Fields: id, teamId, userId, roleId, joinedAt, invitedBy, invitedAt, acceptedAt, isActive
   - Relationships: belongs to Team, User, and TeamRole

3. **TeamRole**
   - Defines roles with specific permissions
   - Fields: id, name, description, permissions (JSON), isSystem, isActive, sortOrder, tenantId
   - System roles are predefined and cannot be deleted

4. **Permission**
   - Master list of all available permissions in the system
   - Fields: id, name, category, description, isActive

## Permission System

### Permission Categories

- **Contacts**: View, create, edit, delete, export, import contacts
- **Companies**: View, create, edit, delete, export companies
- **Deals**: View, create, edit, delete, change stage
- **Tasks**: View, create, edit, delete, assign, complete tasks
- **Products**: View, create, edit, delete, manage inventory
- **Invoices**: View, create, edit, delete, send, mark as paid
- **Quotations**: View, create, edit, delete, send, convert
- **Workflows**: View, create, edit, delete, execute workflows
- **Forms**: View, create, edit, delete, view submissions
- **Email Campaigns**: View, create, edit, delete, send campaigns
- **Landing Pages**: View, create, edit, delete, publish pages
- **Analytics**: View dashboard, view reports, export reports
- **Settings**: View, edit business settings, manage integrations
- **Team Management**: View, create, edit, delete teams, invite/remove members, manage roles
- **Billing**: View billing, manage subscription, view invoices

### Default Roles

1. **Administrator**: Full access to all features
2. **Manager**: Manage team activities and reports
3. **Sales Representative**: Manage own contacts, deals, and tasks
4. **Marketing**: Manage marketing campaigns and content
5. **Support**: View and assist with customer issues
6. **Viewer**: Read-only access

## Plan Limits

### Team Limits by Plan

- **Free Plan**: No teams allowed
- **Starter Plan**: 1 team, 5 members per team
- **Professional Plan**: 3 teams, 10 members per team
- **Enterprise Plan**: Unlimited teams and members

## API Endpoints

### Teams Management

- `GET /api/teams` - List all teams for the tenant
- `POST /api/teams` - Create a new team
- `GET /api/teams/[teamId]` - Get team details with members
- `PUT /api/teams/[teamId]` - Update team information
- `DELETE /api/teams/[teamId]` - Soft delete a team

### Team Members

- `GET /api/teams/[teamId]/members` - List team members
- `POST /api/teams/[teamId]/members` - Invite a new member
- `PUT /api/teams/[teamId]/members/[memberId]` - Update member role or status
- `DELETE /api/teams/[teamId]/members/[memberId]` - Remove member from team

### Roles Management

- `GET /api/teams/roles` - List all roles for the tenant
- `POST /api/teams/roles` - Create a custom role
- `GET /api/teams/roles/[roleId]` - Get role details
- `PUT /api/teams/roles/[roleId]` - Update role permissions
- `DELETE /api/teams/roles/[roleId]` - Delete custom role (non-system only)

## UI Components

### Teams Page (`/dashboard/teams`)
- List all teams with member counts
- Create new teams (respects plan limits)
- Quick actions: View, Settings, Delete

### Team Detail Page (`/dashboard/teams/[teamId]`)
- Team information and description
- List of team members with roles
- Invite new members
- Manage member roles
- Remove members

### Roles Page (`/dashboard/teams/roles`)
- List all roles (system and custom)
- Create custom roles with permission builder
- Edit non-system roles
- View role usage (member count)

## Permission Checking

### In API Routes

```typescript
import { hasPermission, Permission } from "@/app/lib/permissions";
import { checkUserTeamPermission } from "@/app/lib/team-init";

// Check system-level permission
if (!hasPermission(user.role, Permission.MANAGE_TEAM, user.permissions)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Check team-level permission
const hasTeamPermission = await checkUserTeamPermission(userId, "contacts.create");
if (!hasTeamPermission) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### In Frontend Components

```typescript
import { useSession } from "next-auth/react";
import { hasTeamPermission } from "@/app/lib/team-permissions";

// Check if user has permission
const canCreateContacts = hasTeamPermission(userPermissions, "contacts.create");

// Conditionally render based on permissions
{canCreateContacts && (
  <Button onClick={handleCreate}>Create Contact</Button>
)}
```

## Security Considerations

1. **Tenant Isolation**: All team operations are scoped to the user's tenant
2. **Permission Inheritance**: Users inherit permissions from their team roles
3. **Owner Protection**: Team owners cannot be removed from their own teams
4. **System Role Protection**: System roles cannot be deleted or have core permissions removed
5. **Plan Enforcement**: Team and member limits are enforced based on subscription plan

## Best Practices

1. **Role Design**: Create roles that match your organization's structure
2. **Least Privilege**: Grant only necessary permissions to each role
3. **Regular Audits**: Review team memberships and permissions regularly
4. **Clear Naming**: Use descriptive names for teams and custom roles
5. **Documentation**: Document custom roles and their intended use

## Migration Guide

When implementing this system in an existing application:

1. Run database migrations to add new tables
2. Initialize default roles for each tenant
3. Migrate existing user permissions to team-based permissions
4. Update API middleware to check team permissions
5. Update UI components to respect new permissions

## Troubleshooting

### Common Issues

1. **"Your plan allows only X teams"**: Upgrade plan or delete unused teams
2. **"Cannot delete team with active members"**: Remove all members first
3. **"Role name already exists"**: Choose a unique role name
4. **Permission denied errors**: Check user's team memberships and role permissions

### Debugging

Enable debug logging in the console:
```typescript
// In development
console.log("User permissions:", await getUserTeamPermissions(userId));
```

## Future Enhancements

1. **Nested Teams**: Support for sub-teams and hierarchical structures
2. **Permission Templates**: Pre-built permission sets for common use cases
3. **Audit Logs**: Detailed logging of all team and permission changes
4. **Bulk Operations**: Invite multiple members, bulk role assignments
5. **API Keys**: Team-specific API keys with role-based permissions
6. **SSO Integration**: Map external groups to internal teams/roles 