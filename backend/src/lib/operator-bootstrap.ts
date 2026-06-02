import { prisma } from './prisma';

const defaultNotifications = [
  { id: 'replies', label: 'New replies', email: true, slack: true, inapp: true },
  { id: 'meeting', label: 'Meeting booked', email: true, slack: true, inapp: true },
  { id: 'errors', label: 'Campaign errors', email: true, slack: true, inapp: true },
  { id: 'deliverability', label: 'Low deliverability', email: true, slack: true, inapp: false },
  { id: 'intent', label: 'High intent leads', email: false, slack: true, inapp: true },
  { id: 'enrichment', label: 'Enrichment complete', email: false, slack: true, inapp: false },
  { id: 'weekly', label: 'Weekly digest', email: true, slack: false, inapp: false },
];

/** Ensures operator has workspace + settings rows (for users created before merge). */
export async function ensureOperatorBootstrap(operatorId: string) {
  let operator = await prisma.operator.findUnique({
    where: { id: operatorId },
    include: { workspace: true, settings: true },
  });

  if (!operator) {
    return null;
  }

  if (!operator.settings) {
    operator = await prisma.operator.update({
      where: { id: operatorId },
      data: {
        settings: {
          create: { notifications: defaultNotifications },
        },
      },
      include: { workspace: true, settings: true },
    });
  }

  if (!operator.workspace) {
    const anyWorkspace = await prisma.workspace.findFirst();
    if (anyWorkspace) {
      operator = await prisma.operator.update({
        where: { id: operatorId },
        data: { workspace_id: anyWorkspace.id },
        include: { workspace: true, settings: true },
      });
    } else {
      operator = await prisma.operator.update({
        where: { id: operatorId },
        data: {
          workspace: {
            create: {
              name: 'Default Workspace',
              domain: 'company.com',
            },
          },
        },
        include: { workspace: true, settings: true },
      });
    }
  }

  return operator;
}
