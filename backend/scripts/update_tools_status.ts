import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enabledTools = ["apollo", "clay", "smartlead", "heyreach", "instantly", "hubspot", "bettercontact"];

  // Set enabled to active
  const activeResult = await prisma.tool.updateMany({
    where: {
      tool_id: { in: enabledTools }
    },
    data: { status: 'active' }
  });
  console.log(`Updated ${activeResult.count} tools to 'active'`);

  // Set rest to comingSoon
  const soonResult = await prisma.tool.updateMany({
    where: {
      tool_id: { notIn: enabledTools }
    },
    data: { status: 'comingSoon' }
  });
  console.log(`Updated ${soonResult.count} tools to 'comingSoon'`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
