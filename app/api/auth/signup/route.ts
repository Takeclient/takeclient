import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/app/lib/prisma';
import { PLAN_CONFIGS } from '@/app/lib/plans';
import { initializeDefaultRoles } from '@/app/api/teams/roles/route';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName, planName, billingInterval } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !companyName || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!PLAN_CONFIGS[planName as keyof typeof PLAN_CONFIGS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create tenant slug from company name
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists and make it unique
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.tenant.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Find the plan in the database
    let plan = await prisma.plan.findUnique({
      where: { name: planName }
    });

    // If plan doesn't exist, create it (this handles cases where plans haven't been seeded yet)
    if (!plan) {
      const planConfig = PLAN_CONFIGS[planName as keyof typeof PLAN_CONFIGS];
      plan = await prisma.plan.create({
        data: {
          name: planConfig.name,
          displayName: planConfig.displayName,
          description: planConfig.description || '',
          price: planConfig.price,
          yearlyPrice: planConfig.yearlyPrice || planConfig.price * 10, // Default yearly discount
          features: planConfig.features,
          stripePriceId: planConfig.stripePriceId,
          stripeYearlyPriceId: planConfig.stripeYearlyPriceId,
          sortOrder: Object.keys(PLAN_CONFIGS).indexOf(planConfig.name) + 1,
        },
      });
    }

    // Calculate trial end date (14 days from now for paid plans)
    const trialEndsAt = planName !== 'FREE' 
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      : null;

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug: uniqueSlug,
          planId: plan!.id,
          trialEndsAt,
        },
      });

      // Create user as tenant owner
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          isOwner: true,
          tenantId: tenant.id,
        },
      });

      // Create subscription record for paid plans
      if (planName !== 'FREE') {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan!.id,
            status: 'TRIALING',
            interval: billingInterval === 'yearly' ? 'YEARLY' : 'MONTHLY',
            trialStart: new Date(),
            trialEnd: trialEndsAt,
          },
        });
      }

      return { tenant, user };
    });

    // Initialize default team roles
    await initializeDefaultRoles(result.tenant.id);

    return NextResponse.json({
      message: 'Account created successfully',
      tenantId: result.tenant.id,
      userId: result.user.id,
      tenantSlug: result.tenant.slug,
      plan: planName,
      trialEndsAt,
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }
      if (error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'Company name is already taken' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 