import { prisma } from '../lib/prisma';

const CREDIT_COST_MAP: Record<string, number> = {
  'claude-sonnet-4-20260506': 5,
  'claude-3-haiku': 1,
  'claude-3-opus': 15,
  'gpt-4o': 8,
  'gpt-4o-mini': 2,
  'mock': 0,
};

export class CreditWalletService {
  async getBalance(clientId: string): Promise<{ balance: number; total_used: number }> {
    let credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit) {
      credit = await prisma.clientCredit.create({
        data: { client_id: clientId, balance: 2000, total_used: 0 },
      });
    }
    return { balance: credit.balance, total_used: credit.total_used };
  }

  async ensureSufficient(clientId: string, model: string): Promise<void> {
    if (process.env.EXECUTION_MODE === 'mock') return;
    const cost = CREDIT_COST_MAP[model] || 3;
    const { balance } = await this.getBalance(clientId);
    if (balance < cost) {
      throw new Error(`Insufficient credits: ${balance} available, ${cost} needed. Top up at /dashboard/settings.`);
    }
  }

  async deduct(
    clientId: string,
    model: string,
    context: { description?: string; tool_name?: string; action?: string; campaign_id?: string; execution_id?: string },
  ): Promise<void> {
    if (process.env.EXECUTION_MODE === 'mock') return;
    const cost = CREDIT_COST_MAP[model] || 3;
    const credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit || credit.balance < cost) {
      throw new Error(`Insufficient credits. Top up at /dashboard/settings.`);
    }
    await prisma.$transaction([
      prisma.clientCredit.update({
        where: { client_id: clientId },
        data: { balance: { decrement: cost }, total_used: { increment: cost } },
      }),
      prisma.creditTransaction.create({
        data: {
          credit_id: credit.id,
          amount: -cost,
          type: 'debit',
          description: context.description || `AI call (${model})`,
          tool_name: context.tool_name,
          action: context.action,
          campaign_id: context.campaign_id,
          execution_id: context.execution_id,
        },
      }),
    ]);
  }

  async addCredits(clientId: string, amount: number, description?: string): Promise<{ balance: number }> {
    let credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit) {
      credit = await prisma.clientCredit.create({
        data: { client_id: clientId, balance: 0, total_used: 0 },
      });
    }
    await prisma.$transaction([
      prisma.clientCredit.update({
        where: { client_id: clientId },
        data: { balance: { increment: amount } },
      }),
      prisma.creditTransaction.create({
        data: {
          credit_id: credit.id,
          amount,
          type: 'credit',
          description: description || `Manual top-up of ${amount} credits`,
        },
      }),
    ]);
    const { balance } = await this.getBalance(clientId);
    return { balance };
  }

  async getTransactionHistory(clientId: string, limit = 50): Promise<any[]> {
    const credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit) return [];
    return prisma.creditTransaction.findMany({
      where: { credit_id: credit.id },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}

export const creditWallet = new CreditWalletService();
