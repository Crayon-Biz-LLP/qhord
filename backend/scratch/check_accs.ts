import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const accounts = await prisma.clientToolAccount.findMany({});
  console.log(accounts.map(a => a.tool_name + ': ' + a.account_label + ' (' + a.status + ')').join('\n'));
  process.exit(0);
}
run();
