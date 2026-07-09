import { prisma } from '../lib/prisma';

export async function auditLog(params: {
  operator_id?: string;
  client_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  metadata?: any;
  ip_address?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params as any });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
