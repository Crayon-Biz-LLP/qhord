import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { creditWallet } from '../services/credit-wallet.service';

const router = Router();
router.use(requireAuth);

// GET /api/credits — get wallet balance + recent transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string;
    if (!clientId) {
      res.status(400).json({ error: 'clientId query parameter is required' });
      return;
    }
    const { balance, total_used } = await creditWallet.getBalance(clientId);
    const transactions = await creditWallet.getTransactionHistory(clientId);
    res.json({ success: true, balance, total_used, transactions });
  } catch (error: any) {
    console.error('Credit balance error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch credit balance' });
  }
});

// GET /api/credits/dashboard — multi-client credit analytics for agencies
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const clients = await prisma.client.findMany({
      where: { created_by_operator_id: operatorId },
    });

    const clientIds = clients.map((c) => c.id);
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [wallets, aiLogs] = await Promise.all([
      prisma.clientCredit.findMany({ where: { client_id: { in: clientIds } } }),
      prisma.aiExecutionLog.findMany({
        where: { client_id: { in: clientIds }, created_at: { gte: firstOfMonth } },
        select: { client_id: true, input_tokens: true, output_tokens: true, cost_credits: true, model: true, latency_ms: true },
      }),
    ]);

    const clientBreakdown = await Promise.all(
      clients.map(async (client) => {
        const wallet = wallets.find((w) => w.client_id === client.id);
        const credit = wallet ? await prisma.clientCredit.findUnique({ where: { client_id: client.id } }) : null;
        const txThisMonth = credit ? await prisma.creditTransaction.findMany({
          where: { credit_id: credit.id, created_at: { gte: firstOfMonth } },
        }) : [];
        const aiThisMonth = aiLogs.filter((l) => l.client_id === client.id);

        const totalTokens = aiThisMonth.reduce((s, l) => s + (l.input_tokens || 0) + (l.output_tokens || 0), 0);
        const inputTokens = aiThisMonth.reduce((s, l) => s + (l.input_tokens || 0), 0);
        const outputTokens = aiThisMonth.reduce((s, l) => s + (l.output_tokens || 0), 0);
        const creditsConsumed = txThisMonth.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        const wholesaleCost = inputTokens * 0.000003 + outputTokens * 0.000015;
        const retailValue = creditsConsumed * 0.001;
        const margin = retailValue > 0 ? ((retailValue - wholesaleCost) / retailValue) * 100 : 0;
        const activeCampaigns = await prisma.campaign.count({
          where: { client_id: client.id, status: { in: ['active', 'executing', 'approved'] } },
        });

        return {
          clientId: client.id,
          clientName: client.name,
          activeCampaigns,
          tokensUsed: totalTokens,
          inputTokens,
          outputTokens,
          creditsConsumed,
          currentBalance: wallet?.balance || 0,
          wholesaleCost: Math.round(wholesaleCost * 100) / 100,
          retailValue: Math.round(retailValue * 100) / 100,
          margin: Math.round(margin * 10) / 10,
          aiCallCount: aiThisMonth.length,
        };
      }),
    );

    const masterPool = wallets.reduce((s, w) => s + w.balance, 0);
    const totalCreditsConsumed = clientBreakdown.reduce((s, c) => s + c.creditsConsumed, 0);
    const totalTokensUsed = clientBreakdown.reduce((s, c) => s + c.tokensUsed, 0);
    const totalWholesale = clientBreakdown.reduce((s, c) => s + c.wholesaleCost, 0);
    const totalRetail = clientBreakdown.reduce((s, c) => s + c.retailValue, 0);

    res.json({
      masterPool,
      totalCreditsConsumed,
      totalTokensUsed,
      totalWholesale: Math.round(totalWholesale * 100) / 100,
      totalRetail: Math.round(totalRetail * 100) / 100,
      overallMargin: totalRetail > 0 ? Math.round(((totalRetail - totalWholesale) / totalRetail) * 1000) / 10 : 0,
      clientBreakdown,
      month: firstOfMonth.toISOString(),
    });
  } catch (error: any) {
    console.error('Credit dashboard error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch credit dashboard' });
  }
});

// POST /api/credits/top-up — add credits (simulated payment)
router.post('/top-up', async (req: Request, res: Response) => {
  try {
    const { clientId, amount } = req.body as { clientId: string; amount: number };
    if (!clientId || !amount || amount <= 0) {
      res.status(400).json({ error: 'clientId and positive amount are required' });
      return;
    }
    const capped = Math.min(amount, 100000);
    const result = await creditWallet.addCredits(clientId, capped, `Top-up of ${capped} credits`);
    res.json({ success: true, balance: result.balance, added: capped });
  } catch (error: any) {
    console.error('Credit top-up error:', error);
    res.status(500).json({ error: error.message || 'Failed to top up credits' });
  }
});

// POST /api/credits/deduct — manually deduct credits (for testing/admin)
router.post('/deduct', async (req: Request, res: Response) => {
  try {
    const { clientId, amount, description } = req.body as { clientId: string; amount: number; description?: string };
    if (!clientId || !amount) {
      res.status(400).json({ error: 'clientId and amount are required' });
      return;
    }
    await creditWallet.deduct(clientId, 'manual', { description: description || `Manual deduction of ${amount}` });
    const { balance } = await creditWallet.getBalance(clientId);
    res.json({ success: true, balance, deducted: amount });
  } catch (error: any) {
    console.error('Credit deduct error:', error);
    res.status(500).json({ error: error.message || 'Failed to deduct credits' });
  }
});

export default router;
