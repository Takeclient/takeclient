import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  console.log('🛡️ Seeding Super Admin user...');

  try {
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    // Create super admin user
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@crm-system.com' },
      update: {
        role: Role.SUPER_ADMIN,
        isSuperAdmin: true,
        isActive: true,
        tenantId: null, // Super admin doesn't belong to any tenant
      },
      create: {
        name: 'Super Admin',
        email: 'admin@crm-system.com',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        isSuperAdmin: true,
        isOwner: false, // Super admin is not a tenant owner
        isActive: true,
        emailVerified: new Date(),
        tenantId: null, // Super admin doesn't belong to any tenant
      },
    });

    console.log('✅ Created Super Admin user:', superAdmin.email);
    console.log('');
    console.log('🔑 Super Admin Credentials:');
    console.log('Email: admin@crm-system.com');
    console.log('Password: superadmin123');
    console.log('');
    console.log('🌟 Super Admin can access:');
    console.log('- Plan Management: /admin/plans');
    console.log('- User Management: /admin/users');
    console.log('- Tenant Management: /admin/tenants');
    console.log('- System Analytics: /admin/analytics');

  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function if this file is executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  seedSuperAdmin()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedSuperAdmin; 