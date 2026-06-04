import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

const SUPPORTED_TOOLS = [
  { tool_id: "apollo", name: "Apollo.io", category: "Prospecting & Data", description: "B2B database and sales engagement platform" },
  { tool_id: "zoominfo", name: "ZoomInfo", category: "Prospecting & Data", description: "B2B contact & company intelligence" },
  { tool_id: "cognism", name: "Cognism", category: "Prospecting & Data", description: "GDPR-compliant B2B prospecting data" },
  { tool_id: "lusha", name: "Lusha", category: "Prospecting & Data", description: "Contact & company data enrichment" },
  { tool_id: "clay", name: "Clay", category: "Enrichment", description: "Data enrichment & buying signals orchestration" },
  { tool_id: "clearbit", name: "Clearbit", category: "Enrichment", description: "Real-time B2B data enrichment" },
  { tool_id: "smartlead", name: "Smartlead", category: "Email Outreach", description: "Email campaign scale automation" },
  { tool_id: "hunter", name: "Hunter", category: "Prospecting & Data", description: "Discover companies and find/verify emails (free API tier)" },
  { tool_id: "brevo", name: "Brevo", category: "Email Outreach", description: "Email campaigns and transactional send (free tier)" },
  { tool_id: "instantly", name: "Instantly", category: "Email Outreach", description: "Cold email at scale with deliverability focus" },
  { tool_id: "lemlist", name: "Lemlist", category: "Email Outreach", description: "Personalized cold outreach platform" },
  { tool_id: "heyreach", name: "HeyReach", category: "LinkedIn", description: "LinkedIn outreach and multi-channel scale" },
  { tool_id: "expandi", name: "Expandi", category: "LinkedIn", description: "Smart LinkedIn automation tool" },
  { tool_id: "zapier", name: "Zapier", category: "Automation", description: "No-code workflow and app automation" },
  { tool_id: "make", name: "Make", category: "Automation", description: "Visual workflow automation platform" },
  { tool_id: "hubspot", name: "HubSpot", category: "CRM", description: "CRM & marketing scale platform" },
  { tool_id: "salesforce", name: "Salesforce", category: "CRM", description: "Enterprise CRM and revenue cloud" },
  { tool_id: "pipedrive", name: "Pipedrive", category: "CRM", description: "Sales-first CRM for focused teams" },
];

const PLAYBOOKS = [
  {
    name: "SaaS SDR Playbook",
    difficulty: "Intermediate",
    description: "Complete outbound motion for SaaS companies targeting mid market. Includes ICP enrichment, multi-channel sequences, and automated follow-ups.",
    creator: "Control Tower Team",
    rating: 4.8,
    imports: "2.3K",
    confidence: 82,
    deploy_time: "15 minutes",
    credits: 40,
    category: "SaaS",
    reply_rate: "8-12%"
  },
  {
    name: "Fintech Outreach System",
    difficulty: "Advanced",
    description: "Targeted outreach for fintech decision makers with compliance-safe messaging and high-deliverability focus.",
    creator: "Control Tower Team",
    rating: 4.6,
    imports: "1.9K",
    confidence: 75,
    deploy_time: "25 minutes",
    credits: 25,
    category: "Fintech",
    reply_rate: "6-10%"
  },
  {
    name: "Agency Cold Email Engine",
    difficulty: "Beginner",
    description: "High volume email outreach system for agencies. Optimized for scale with inbox rotation and warm-up.",
    creator: "Control Tower Team",
    rating: 4.9,
    imports: "3.1K",
    confidence: 88,
    deploy_time: "10 minutes",
    credits: 15,
    category: "Agency",
    reply_rate: "10-13%"
  }
];

async function main() {
  console.log('Seeding tools...');
  for (const tool of SUPPORTED_TOOLS) {
    await prisma.tool.upsert({
      where: { tool_id: tool.tool_id },
      update: tool,
      create: tool,
    });
  }

  console.log('Seeding playbooks...');
  for (const playbook of PLAYBOOKS) {
    const existing = await prisma.playbook.findFirst({ where: { name: playbook.name } });
    if (!existing) {
      await prisma.playbook.create({ data: playbook });
    }
  }

  let client = await prisma.client.findFirst();
  if (!client) {
    let operator = await prisma.operator.findFirst();
    if (!operator) {
      operator = await prisma.operator.create({
        data: {
          email: 'admin@qhord.com',
          name: 'Default Admin',
          password_hash: '$2b$12$Z0h87X9.pD5eB.98yE6k.OWmO9c7L2yF3t1n3s4r5p6c7d8e9f0g1',
          role: 'admin'
        }
      });
    }
    client = await prisma.client.create({
      data: {
        name: 'Default Client',
        description: 'Auto-created client for default data',
        created_by_operator_id: operator.id
      }
    });
  }

  const dealsCount = await prisma.deal.count();
  if (dealsCount === 0) {
    console.log('Seeding deals...');
    const mockDeals = [
      { name: "GrowthCo Expansion", contact: "Alex Kim", amount: "$18.5K", health: 92, stage: "New Lead", auto: true, avatar: "A", client_id: client.id },
      { name: "VentureX Pilot", contact: "Chris Lee", amount: "$39K", health: 85, stage: "New Lead", auto: true, avatar: "C", client_id: client.id },
      { name: "Series B Round", contact: "Sarah M.", amount: "$85K", health: 65, stage: "New Lead", auto: false, avatar: "S", client_id: client.id },
      { name: "DataFlow Enterprise", contact: "James Wilson", amount: "$32K", health: 78, stage: "Engaged", auto: true, avatar: "J", client_id: client.id },
      { name: "NextGen SaaS", contact: "Nina Patel", amount: "$54K", health: 94, stage: "Engaged", auto: true, avatar: "N", client_id: client.id },
      { name: "TechCorp Global", contact: "Sarah Chen", amount: "$45K", health: 88, stage: "Meeting", auto: true, avatar: "S", client_id: client.id },
      { name: "Mercedes EMEA", contact: "Mike T.", amount: "$80K", health: 91, stage: "Meeting", auto: true, avatar: "M", client_id: client.id },
      { name: "CloudBase Pro", contact: "Maria Garcia", amount: "$280K", health: 92, stage: "Proposal", auto: false, avatar: "M", client_id: client.id },
      { name: "ScaleUp Suite", contact: "Lisa Park", amount: "$67K", health: 98, stage: "Closed", auto: true, avatar: "L", client_id: client.id }
    ];
    for (const deal of mockDeals) {
      await prisma.deal.create({ data: deal });
    }
  }

  const inboxCount = await prisma.inboxMessage.count();
  if (inboxCount === 0) {
    console.log('Seeding inbox messages...');
    const mockMessages = [
      {
        sender: "Sarah Chen",
        company: "Stripe",
        campaign: "Series B Fintech Outreach",
        subject: "Re: Quick question about your stack",
        body: "Hey, thanks for reaching out! I'd love to chat more about how you handle outbound. We're actually looking for a solution like this.",
        tags: ["positive", "interested"],
        tool: "Smartlead",
        unread: true,
        sentiment: "High Intent",
        avatar: "S",
        client_id: client.id
      },
      {
        sender: "Marcus Johnson",
        company: "Figma",
        campaign: "Enterprise SaaS Q1",
        subject: "Re: Optimizing your GTM stack",
        body: "Interesting timing — we were just looking at solutions like yours. Can we discuss next week?",
        tags: ["positive"],
        tool: "HeyReach",
        unread: true,
        sentiment: "Inquisitive",
        avatar: "M",
        client_id: client.id
      },
      {
        sender: "David Kim",
        company: "Linear",
        campaign: "Enterprise SaaS Q1",
        subject: "LinkedIn Connection",
        body: "Accepted your connection request and sent a message: \"Thanks for connecting, sounds interesting!\"",
        tags: ["positive"],
        tool: "LinkedIn",
        unread: true,
        sentiment: "Standard",
        avatar: "D",
        client_id: client.id
      },
      {
        sender: "Lisa Wang",
        company: "Vercel",
        campaign: "Product-Led Growth Targets",
        subject: "Re: Scaling Vercel's outreach",
        body: "Let me loop in our team lead on this. We have budget allocated for Q2.",
        tags: ["positive", "interested"],
        tool: "Smartlead",
        unread: false,
        sentiment: "High Intent",
        avatar: "L",
        client_id: client.id
      }
    ];
    for (const msg of mockMessages) {
      await prisma.inboxMessage.create({ data: msg });
    }
  }

  const plansCount = await prisma.plan.count();
  if (plansCount === 0) {
    console.log('Seeding pricing plans...');
    const mockPlans = [
      {
        name: "Starter",
        tagline: "For individuals",
        price: "$149",
        credits: "2,500",
        features: ["Unified dashboard", "Basic campaign builder", "Personal notes", "AI suggestions only", "Basic enrichment"],
        button_text: "Start Free",
        is_custom: false
      },
      {
        name: "Growth",
        tagline: "For teams scaling",
        price: "$349",
        credits: "8,000",
        features: ["Multi-channel", "Advanced workflows", "Health monitoring", "Full AI Operator", "Sequence optimization", "Full Stack Access"],
        button_text: "Upgrade Now",
        is_custom: false
      },
      {
        name: "Pro",
        tagline: "High-scale AI",
        price: "$799",
        credits: "20,000",
        features: ["Unlimited campaigns", "Team permissions", "Priority", "Autonomous mode", "Predictive models", "Custom orchestration"],
        button_text: "Go Pro",
        is_custom: false
      }
    ];
    for (const plan of mockPlans) {
      await prisma.plan.create({ data: plan });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
