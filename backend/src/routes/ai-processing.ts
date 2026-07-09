import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AiProcessingNodeService } from '../services/ai-processing-node.service';
import { creditWallet } from '../services/credit-wallet.service';

const router = Router();
const aiProcessing = new AiProcessingNodeService();

router.use(requireAuth);

// POST /api/ai-processing/execute — run AI on a single lead
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { clientId, leadId, promptTemplate, targetOutputVariable, systemContext, maxTokens } = req.body;
    if (!clientId || !leadId || !promptTemplate || !targetOutputVariable) {
      res.status(400).json({ error: 'clientId, leadId, promptTemplate, and targetOutputVariable are required' });
      return;
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) { res.status(404).json({ error: 'Lead not found' }); return; }

    await creditWallet.ensureSufficient(clientId, 'ai-processing');
    const result = await aiProcessing.execute(clientId, lead as any, {
      promptTemplate, targetOutputVariable, systemContext, maxTokens,
    });

    res.json({ success: true, output: result.output, variableName: result.variableName });
  } catch (error: any) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute AI processing' });
  }
});

// POST /api/ai-processing/batch — run AI on multiple leads
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { clientId, leadIds, promptTemplate, targetOutputVariable, systemContext, maxTokens } = req.body;
    if (!clientId || !leadIds?.length || !promptTemplate || !targetOutputVariable) {
      res.status(400).json({ error: 'clientId, leadIds[], promptTemplate, and targetOutputVariable are required' });
      return;
    }

    await creditWallet.ensureSufficient(clientId, 'ai-processing-batch');
    const leads = await prisma.lead.findMany({ where: { id: { in: leadIds }, client_id: clientId } });
    const result = await aiProcessing.executeBatch(clientId, leads as any, {
      promptTemplate, targetOutputVariable, systemContext, maxTokens,
    });

    res.json({ success: true, processed: result.processed, outputs: result.outputs });
  } catch (error: any) {
    console.error('AI batch processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute batch AI processing' });
  }
});

// GET /api/ai-processing/brand/:clientId — get brand context
router.get('/brand/:clientId', async (req: Request, res: Response) => {
  try {
    const context = await aiProcessing.getBrandContext(req.params.clientId);
    res.json({ context });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/ai-processing/brand/:clientId — upsert brand profile
router.put('/brand/:clientId', async (req: Request, res: Response) => {
  try {
    const { name, dataText } = req.body;
    if (!name) { res.status(400).json({ error: 'name is required' }); return; }
    const result = await aiProcessing.upsertBrandProfile(req.params.clientId, name, dataText || '');
    res.json({ success: true, brand: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
