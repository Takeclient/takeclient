import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🔧 Seeding subscription plans...');

  try {
    const plans = [
      {
        id: 'free',
        name: 'FREE',
        displayName: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        yearlyPrice: 0,
        features: {
          contacts: 100,
          deals: 50,
          companies: 25,
          users: 1,
          forms: 3,
          storage: '1GB',
          support: 'Email',
          automations: 0,
          integrations: 1,
        },
        isActive: true,
        sortOrder: 0,
      },
      {
        id: 'normal',
        name: 'NORMAL',
        displayName: 'Professional',
        description: 'For growing businesses',
        price: 2900, // $29.00
        yearlyPrice: 29000, // $290.00 (yearly discount)
        features: {
          contacts: 1000,
          deals: 500,
          companies: 200,
          users: 5,
          forms: 15,
          storage: '10GB',
          support: 'Email + Chat',
          automations: 10,
          integrations: 5,
        },
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'premium',
        name: 'PREMIUM',
        displayName: 'Premium',
        description: 'For established businesses',
        price: 4900, // $49.00
        yearlyPrice: 49000, // $490.00 (yearly discount)
        features: {
          contacts: 5000,
          deals: 2000,
          companies: 1000,
          users: 15,
          forms: 50,
          storage: '50GB',
          support: 'Priority Support',
          automations: 50,
          integrations: 15,
        },
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'elite',
        name: 'ELITE',
        displayName: 'Enterprise',
        description: 'For large organizations',
        price: 9900, // $99.00
        yearlyPrice: 99000, // $990.00 (yearly discount)
        features: {
          contacts: -1, // Unlimited
          deals: -1, // Unlimited
          companies: -1, // Unlimited
          users: -1, // Unlimited
          forms: -1, // Unlimited
          storage: '500GB',
          support: '24/7 Phone + Dedicated Manager',
          automations: -1, // Unlimited
          integrations: -1, // Unlimited
        },
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const planData of plans) {
      await prisma.plan.upsert({
        where: { name: planData.name },
        update: planData,
        create: planData,
      });
    }

    console.log('✅ Successfully seeded subscription plans');
    
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function if this file is executed directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  seedPlans()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedPlans; 