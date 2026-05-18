import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { ExecutionRequestPayload } from '../types';
import { ExecutionEngine } from '../services/execution.engine';

const router = Router();
const engine = new ExecutionEngine();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  const { clientId } = req.query as { clientId?: string };
  try {
    const executions = await prisma.execution.findMany({
      where: {
        triggered_by_operator_id: req.user!.id,
        client_id: clientId ? clientId : undefined
      },
      orderBy: { created_at: 'desc' },
      take: 200
    });
    res.json({ executions });
  } catch (err) {
    console.error('List executions error', err);
    res.status(500).json({ message: 'Failed to fetch executions' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const body = req.body as ExecutionRequestPayload;
  const { clientId, tool, toolAccountId, action, payload } = body;

  if (!clientId || !tool || !toolAccountId || !action) {
    res
      .status(400)
      .json({ message: 'clientId, tool, toolAccountId and action are required', payload: body.payload ?? null });
    return;
  }

  try {
    const execution = await engine.execute(body, req.user!.id);
    res.status(201).json({ execution });
  } catch (err: any) {
    console.error('Execution error', err);
    res.status(400).json({ message: err?.message || 'Failed to execute action' });
  }
});

export default router;

