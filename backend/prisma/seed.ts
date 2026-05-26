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

async function main() {
  console.log('Seeding tools...');
  for (const tool of SUPPORTED_TOOLS) {
    await prisma.tool.upsert({
      where: { tool_id: tool.tool_id },
      update: tool,
      create: tool,
    });
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
