const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "workflow_run_steps" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "workflow_edges" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "workflow_nodes" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "campaign_workflow_runs" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "campaign_workflows" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "workflow_runs" CASCADE;');
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "workflows" CASCADE;');
  console.log('Dropped');
}
main().finally(() => prisma.$disconnect());
