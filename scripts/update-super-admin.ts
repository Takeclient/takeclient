import prisma from '../app/lib/prisma.js';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

async function updateSuperAdmin() {
  try {
    console.log('🔧 Updating super admin user...');

    const email = 'admin@crm-system.com';
    const password = 'superadmin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: Role.SUPER_ADMIN,
          isSuperAdmin: true,
          password: hashedPassword,
          name: 'Super Admin',
          isActive: true,
          tenantId: null, // Super admin shouldn't belong to any tenant
        },
      });

      console.log('✅ Super admin user updated successfully:');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log(`   Is Super Admin: ${updatedUser.isSuperAdmin}`);
      console.log(`   Password: superadmin123`);
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Super Admin',
          role: Role.SUPER_ADMIN,
          isSuperAdmin: true,
          isActive: true,
          tenantId: null, // Super admin shouldn't belong to any tenant
        },
      });

      console.log('✅ Super admin user created successfully:');
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
      console.log(`   Is Super Admin: ${newUser.isSuperAdmin}`);
      console.log(`   Password: superadmin123`);
    }

    // Show all super admins in the system
    console.log('\n📋 All super admins in the system:');
    const superAdmins = await prisma.user.findMany({
      where: {
        OR: [
          { role: Role.SUPER_ADMIN },
          { isSuperAdmin: true },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperAdmin: true,
        tenantId: true,
      },
    });

    superAdmins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name || 'Unnamed'} (${admin.email})`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Is Super Admin Flag: ${admin.isSuperAdmin}`);
      console.log(`   Tenant ID: ${admin.tenantId || 'None (Platform Admin)'}`);
      console.log(`   Status: ${admin.role === Role.SUPER_ADMIN && admin.isSuperAdmin ? '✅ Valid Super Admin' : '⚠️  Needs Update'}`);
    });

  } catch (error) {
    console.error('❌ Error updating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin(); 