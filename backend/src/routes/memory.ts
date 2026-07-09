import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { MemoryService } from '../services/memory.service';
import { PatternAnalyzerService } from '../services/pattern-analyzer.service';
import { PromptRefinerService } from '../services/prompt-refiner.service';
import { PlannerMemoryService } from '../services/planner-memory.service';

const router = Router();
const memoryService = new MemoryService();
const patternAnalyzer = new PatternAnalyzerService();
const promptRefiner = new PromptRefinerService();
const plannerMemoryService = new PlannerMemoryService();

router.use(requireAuth);

// Get consolidated memory context for a workspace
router.get('/context', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const context = await memoryService.getMemoryContext(operator.workspace_id);
    res.json({ success: true, context });
  } catch (error) {
    console.error('Memory context error:', error);
    res.status(500).json({ error: 'Failed to fetch memory context' });
  }
});

// Run memory consolidation
router.post('/consolidate', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const result = await memoryService.consolidateMemory(operator.workspace_id);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Consolidation error:', error);
    res.status(500).json({ error: 'Failed to consolidate memory' });
  }
});

// Get consolidation history
router.get('/consolidations', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ consolidations: [] });

    const consolidations = await memoryService.getConsolidationHistory(operator.workspace_id);
    res.json({ consolidations });
  } catch (error) {
    console.error('Consolidation history error:', error);
    res.status(500).json({ error: 'Failed to fetch consolidation history' });
  }
});

// Pattern analysis
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const analysis = await patternAnalyzer.analyze(operator.workspace_id);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze patterns' });
  }
});

// Get AI preferences for workspace
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ preferences: {} });

    const preferences = await memoryService.getPreferences(operator.workspace_id);
    res.json({ preferences });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update AI preference
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'key is required' });

    await memoryService.setPreference(operator.workspace_id, key, value);
    res.json({ success: true });
  } catch (error) {
    console.error('Update preference error:', error);
    res.status(500).json({ error: 'Failed to update preference' });
  }
});

// Store conversation memory
router.post('/conversation', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const { role, content, sessionId, metadata, tokenCount } = req.body;
    if (!role || !content) return res.status(400).json({ error: 'role and content are required' });

    const entry = await memoryService.storeConversation({
      workspaceId: operator.workspace_id,
      role,
      content,
      sessionId,
      metadata,
      tokenCount,
    });
    res.json({ success: true, entry });
  } catch (error) {
    console.error('Store conversation error:', error);
    res.status(500).json({ error: 'Failed to store conversation' });
  }
});

// Get conversation history
router.get('/conversation', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ conversations: [] });

    const sessionId = req.query.session_id as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const where: any = { workspace_id: operator.workspace_id };
    if (sessionId) where.session_id = sessionId;

    const conversations = await prisma.conversationMemory.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    res.json({ conversations });
  } catch (error) {
    console.error('Conversation history error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Record feedback on AI output
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { aiExecutionLogId, rating, comment, approved, correctedOutput } = req.body;
    if (!aiExecutionLogId || rating === undefined) {
      return res.status(400).json({ error: 'aiExecutionLogId and rating are required' });
    }

    const feedback = await promptRefiner.recordFeedback({
      aiExecutionLogId,
      operatorId: req.user!.id,
      rating,
      comment,
      approved,
      correctedOutput,
    });
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get prompt template scores
router.get('/prompts/scores', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    const scores = await promptRefiner.scorePromptTemplates(operator?.workspace_id || undefined);
    res.json({ scores });
  } catch (error) {
    console.error('Prompt scores error:', error);
    res.status(500).json({ error: 'Failed to score prompt templates' });
  }
});

// Get prompt refinement suggestions
router.get('/prompts/refine', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    const suggestions = await promptRefiner.suggestRefinements(operator?.workspace_id || undefined);
    res.json({ suggestions });
  } catch (error) {
    console.error('Prompt refinement error:', error);
    res.status(500).json({ error: 'Failed to suggest refinements' });
  }
});

// Planner memory insights (existing, preserved)
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const prompt = typeof req.query.prompt === 'string' ? req.query.prompt : '';

    const toolAccounts = await prisma.clientToolAccount.findMany({
      where: { created_by_operator_id: operatorId },
      select: { tool_name: true },
      distinct: ['tool_name'],
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
