import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { PlannerMemoryService } from '../services/planner-memory.service';

const router = Router();
const plannerMemoryService = new PlannerMemoryService();

router.use(requireAuth);

router.get('/insights', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const prompt = typeof req.query.prompt === 'string' ? req.query.prompt : '';

    const toolAccounts = await prisma.clientToolAccount.findMany({
      where: { created_by_operator_id: operatorId },
      select: { tool_name: true },
      distinct: ['tool_name']
    });
    const activeTools = toolAccounts.length > 0 ? toolAccounts.map((t) => t.tool_name) : ['Apollo', 'Smartlead'];

    const insights = await plannerMemoryService.getInsights(operatorId, prompt, activeTools);
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Memory insights error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memory insights' });
  }
});

export default router;

