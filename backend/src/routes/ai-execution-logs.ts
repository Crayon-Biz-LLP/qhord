import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/ai-execution-logs — list recent AI execution logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;

    const where: any = {};
    if (clientId) where.client_id = clientId;

    const [logs, total] = await Promise.all([
      prisma.aiExecutionLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          provider_id: true,
          model: true,
          prompt: true,
          response: true,
          input_tokens: true,
          output_tokens: true,
          latency_ms: true,
          cost_credits: true,
          status: true,
          error_message: true,
          client_id: true,
          campaign_id: true,
          created_at: true,
        },
      }),
      prisma.aiExecutionLog.count({ where }),
    ]);

    res.json({ success: true, logs, total });
  } catch (error) {
    console.error('Fetch AI execution logs error:', error);
    res.status(500).json({ error: 'Failed to fetch AI execution logs' });
  }
});

// GET /api/ai-execution-logs/stats — aggregate AI usage stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const where: any = {};
    if (clientId) where.client_id = clientId;

    const logs = await prisma.aiExecutionLog.findMany({
      where,
      select: {
        status: true,
        cost_credits: true,
        latency_ms: true,
        input_tokens: true,
        output_tokens: true,
        model: true,
        created_at: true,
      },
    });

    const totalCalls = logs.length;
    const successCalls = logs.filter(l => l.status === 'success').length;
    const failedCalls = logs.filter(l => l.status === 'failed').length;
    const totalLatency = logs.reduce((sum, l) => sum + (l.latency_ms || 0), 0);
    const totalCost = logs.reduce((sum, l) => sum + (l.cost_credits || 0), 0);
    const totalTokens = logs.reduce((sum, l) => sum + (l.input_tokens || 0) + (l.output_tokens || 0), 0);

    res.json({
      success: true,
      stats: {
        totalCalls,
        successCalls,
        failedCalls,
        successRate: totalCalls > 0 ? parseFloat(((successCalls / totalCalls) * 100).toFixed(1)) : 0,
        avgLatencyMs: totalCalls > 0 ? Math.round(totalLatency / totalCalls) : 0,
        totalCostCredits: totalCost,
        totalTokens,
        uniqueModels: [...new Set(logs.map(l => l.model))],
      },
    });
  } catch (error) {
    console.error('Fetch AI execution stats error:', error);
    res.status(500).json({ error: 'Failed to fetch AI execution stats' });
  }
});

export default router;
