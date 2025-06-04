import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Update plan features to include team limits
  const plans = [
    {
      name: "free",
      displayName: "Free Plan",
      description: "Get started with basic features",
      price: 0,
      features: {
        maxContacts: 100,
        maxUsers: 1,
        maxTeams: 0,
        maxTeamMembers: 0,
        maxForms: 3,
        maxLandingPages: 2,
        maxWorkflows: 1,
        maxEmailsPerMonth: 500,
        customDomain: false,
        whatsappIntegration: false,
        emailCampaigns: false,
        automations: false,
        apiAccess: false,
        support: "community",
        socialMediaAccounts: 1,
        socialMediaPosts: 10
      }
    },
    {
      name: "starter",
      displayName: "Starter Plan",
      description: "Perfect for small teams",
      price: 29.99,
      features: {
        maxContacts: 1000,
        maxUsers: 3,
        maxTeams: 1,
        maxTeamMembers: 5,
        maxForms: 10,
        maxLandingPages: 10,
        maxWorkflows: 5,
        maxEmailsPerMonth: 5000,
        customDomain: true,
        whatsappIntegration: true,
        emailCampaigns: true,
        automations: true,
        apiAccess: false,
        support: "email",
        socialMediaAccounts: 3,
        socialMediaPosts: 100
      }
    },
    {
      name: "professional",
      displayName: "Professional Plan",
      description: "For growing businesses",
      price: 99.99,
      features: {
        maxContacts: 5000,
        maxUsers: 10,
        maxTeams: 3,
        maxTeamMembers: 20,
        maxForms: 50,
        maxLandingPages: 50,
        maxWorkflows: 20,
        maxEmailsPerMonth: 25000,
        customDomain: true,
        whatsappIntegration: true,
        emailCampaigns: true,
        automations: true,
        apiAccess: true,
        support: "priority",
        socialMediaAccounts: 10,
        socialMediaPosts: 500
      }
    },
    {
      name: "enterprise",
      displayName: "Enterprise Plan",
      description: "For large organizations",
      price: 299.99,
      features: {
        maxContacts: 25000,
        maxUsers: 50,
        maxTeams: 10,
        maxTeamMembers: 100,
        maxForms: 200,
        maxLandingPages: 200,
        maxWorkflows: 100,
        maxEmailsPerMonth: 100000,
        customDomain: true,
        whatsappIntegration: true,
        emailCampaigns: true,
        automations: true,
        apiAccess: true,
        support: "dedicated",
        socialMediaAccounts: 50,
        socialMediaPosts: 2000
      }
    }
  ];

  // Upsert plans
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: { features: plan.features },
      create: plan,
    });
    console.log(`✅ Plan ${plan.name} seeded`);
  }

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 