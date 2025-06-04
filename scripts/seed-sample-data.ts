import { PrismaClient, Role, DealStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');

  try {
    // Create a sample tenant
    const sampleTenant = await prisma.tenant.upsert({
      where: { slug: 'sample-company' },
      update: {},
      create: {
        name: 'Sample Company',
        slug: 'sample-company',
        planId: 'free', // This should match the plan's id field
      },
    });

    console.log('✅ Created sample tenant:', sampleTenant.name);

    // Create a sample user for the tenant
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const sampleUser = await prisma.user.upsert({
      where: { email: 'demo@sample-company.com' },
      update: {
        tenantId: sampleTenant.id,
        role: Role.TENANT_ADMIN,
        isOwner: true,
        isActive: true,
      },
      create: {
        name: 'Demo User',
        email: 'demo@sample-company.com',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId: sampleTenant.id,
        isOwner: true,
        isActive: true,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Created sample user:', sampleUser.email);

    // Create some sample contacts
    const sampleContacts = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        jobTitle: 'CEO',
        leadScore: 85,
        tags: ['hot-lead', 'enterprise'],
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        jobTitle: 'Marketing Director',
        leadScore: 65,
        tags: ['marketing', 'qualified'],
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0103',
        jobTitle: 'CTO',
        leadScore: 75,
        tags: ['technical', 'decision-maker'],
      },
    ];

    for (const contactData of sampleContacts) {
      // Check if contact exists first
      const existingContact = await prisma.contact.findFirst({
        where: {
          tenantId: sampleTenant.id,
          email: contactData.email,
        },
      });

      if (!existingContact) {
        await prisma.contact.create({
          data: {
            ...contactData,
            tenantId: sampleTenant.id,
            assignedTo: sampleUser.id,
            status: 'LEAD',
          },
        });
      }
    }

    console.log('✅ Created sample contacts');

    // Create some sample companies
    const sampleCompanies = [
      {
        name: 'Tech Corp Inc',
        industry: 'Technology',
        website: 'https://techcorp.com',
        size: '100-500',
        revenue: 500000000, // $5M
        email: 'hello@techcorp.com',
        phone: '+1-555-0201',
      },
      {
        name: 'Marketing Solutions Ltd',
        industry: 'Marketing',
        website: 'https://marketingsolutions.com',
        size: '50-100',
        revenue: 200000000, // $2M
        email: 'info@marketingsolutions.com',
        phone: '+1-555-0202',
      },
    ];

    for (const companyData of sampleCompanies) {
      // Check if company exists first
      const existingCompany = await prisma.company.findFirst({
        where: {
          tenantId: sampleTenant.id,
          name: companyData.name,
        },
      });

      if (!existingCompany) {
        await prisma.company.create({
          data: {
            ...companyData,
            tenantId: sampleTenant.id,
            assignedTo: sampleUser.id,
            tags: ['client', 'enterprise'],
          },
        });
      }
    }

    console.log('✅ Created sample companies');

    // Create some sample deals
    const company = await prisma.company.findFirst({
      where: { tenantId: sampleTenant.id },
    });

    const contact = await prisma.contact.findFirst({
      where: { tenantId: sampleTenant.id },
    });

    if (company && contact) {
      const sampleDeals = [
        {
          name: 'Q1 Enterprise Deal',
          value: 5000000, // $50k
          stage: DealStage.PROSPECTING,
          probability: 25,
          description: 'Large enterprise deal for Q1',
          source: 'Website',
          tags: ['enterprise', 'q1'],
          closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        {
          name: 'Marketing Package Deal',
          value: 1500000, // $15k
          stage: DealStage.PROPOSAL,
          probability: 75,
          description: 'Marketing automation package',
          source: 'Referral',
          tags: ['marketing', 'automation'],
          closeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        },
      ];

      for (const dealData of sampleDeals) {
        // Check if deal exists first
        const existingDeal = await prisma.deal.findFirst({
          where: {
            tenantId: sampleTenant.id,
            name: dealData.name,
          },
        });

        if (!existingDeal) {
          await prisma.deal.create({
            data: {
              ...dealData,
              tenantId: sampleTenant.id,
              assignedTo: sampleUser.id,
              contactId: contact.id,
              companyId: company.id,
            },
          });
        }
      }

      console.log('✅ Created sample deals');
    }

    console.log('🎉 Sample data seeding completed!');
    console.log('');
    console.log('📧 Demo User Credentials:');
    console.log('Email: demo@sample-company.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function if this file is executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  seedSampleData()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedSampleData; 