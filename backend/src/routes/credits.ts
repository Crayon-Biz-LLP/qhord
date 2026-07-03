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
