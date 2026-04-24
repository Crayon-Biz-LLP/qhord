import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: "Starter",
    tagline: "For individuals starting outbound",
    price: "149",
    credits: "2,500 credits/mo",
    is_custom: false,
    button_text: "Start Free Trial",
    features: [
      "Unified dashboard",
      "Basic campaign builder",
      "AI suggestions only",
      "Basic enrichment"
    ]
  },
  {
    name: "Growth",
    tagline: "For teams scaling outbound with AI",
    price: "349",
    credits: "8,000 credits/mo",
    is_custom: false,
    button_text: "Current Plan", // Represents the current plan for dynamic UI mock
    features: [
      "Multi-channel campaigns",
      "Advanced workflows",
      "Full AI Operator",
      "Clay, Smartlead, HeyReach"
    ]
  },
  {
    name: "Pro",
    tagline: "High-scale AI-driven outbound",
    price: "799",
    credits: "20,000 credits/mo",
    is_custom: false,
    button_text: "Upgrade to Pro",
    features: [
      "Unlimited campaigns",
      "Autonomous AI mode",
      "Campaign DNA",
      "Predictive forecasting"
    ]
  },
  {
    name: "Enterprise",
    tagline: "Complex GTM at scale",
    price: "Custom",
    credits: "Custom credits",
    is_custom: true,
    button_text: "Contact Sales",
    features: [
      "Custom credits",
      "Dedicated infrastructure",
      "Custom integrations",
      "SLA-based support"
    ]
  }
];

async function main() {
  console.log('Seeding plans...');
  // Clear existing plans
  await prisma.plan.deleteMany({});
  
  for (const plan of plans) {
    const createdPlan = await prisma.plan.create({
      data: {
        name: plan.name,
        tagline: plan.tagline,
        price: plan.price,
        credits: plan.credits,
        is_custom: plan.is_custom,
        button_text: plan.button_text,
        features: plan.features
      }
    });
    console.log(`Created plan: ${createdPlan.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
