import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { Execution, ExecutionRequestPayload } from '../types';
import { query } from '../config/db';
import { ExecutionEngine } from '../services/execution.engine';

const router = Router();
const engine = new ExecutionEngine();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  const { clientId } = req.query as { clientId?: string };
  try {
    let sql =
      'SELECT * FROM executions WHERE triggered_by_operator_id = $1 ORDER BY created_at DESC LIMIT 200';
    const params: any[] = [req.user!.id];

    if (clientId) {
      sql =
        'SELECT * FROM executions WHERE triggered_by_operator_id = $1 AND client_id = $2 ORDER BY created_at DESC LIMIT 200';
      params.push(clientId);
    }

    const result = await query<Execution>(sql, params);
    res.json({ executions: result.rows });
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

