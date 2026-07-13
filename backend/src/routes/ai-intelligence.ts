import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { abTestService } from '../services/ab-test.service';
import { predictiveScoringService } from '../services/predictive-scoring.service';
import { confidenceRoutingService } from '../services/confidence-routing.service';
import { conversationSummarizer } from '../services/conversation-summarizer.service';
import { preferenceExtractor } from '../services/preference-extractor.service';

const router = Router();

router.use(requireAuth);

// ── A/B Testing ──

router.get('/ab-tests', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ tests: [] });

    const tests = await abTestService.getTestsForWorkspace(operator.workspace_id);
    res.json({ tests });
  } catch (err: any) {
    console.error('Fetch A/B tests error', err);
    res.status(500).json({ message: 'Failed to fetch A/B tests' });
  }
});

router.post('/ab-tests', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const { name, description, variantAConfig, variantBConfig, variantAName, variantBName } = req.body;
    if (!name || !variantAConfig || !variantBConfig) {
      return res.status(400).json({ error: 'name, variantAConfig, and variantBConfig are required' });
    }

    const test = await abTestService.createTest({
      workspaceId: operator.workspace_id,
      name,
      description,
      variantAConfig,
      variantBConfig,
      variantAName,
      variantBName,
    });

    res.json({ success: true, test });
  } catch (err: any) {
    console.error('Create A/B test error', err);
    res.status(500).json({ message: 'Failed to create A/B test' });
  }
});

router.post('/ab-tests/:id/start', async (req: Request, res: Response) => {
  try {
    await abTestService.startTest(req.params.id);
    res.json({ success: true, message: 'Test started' });
  } catch (err: any) {
    console.error('Start A/B test error', err);
    res.status(500).json({ message: err.message || 'Failed to start test' });
  }
});

router.get('/ab-tests/:id/analyze', async (req: Request, res: Response) => {
  try {
    const analysis = await abTestService.analyzeTest(req.params.id);
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Analyze A/B test error', err);
    res.status(500).json({ message: err.message || 'Failed to analyze test' });
  }
});

router.post('/ab-tests/:id/complete', async (req: Request, res: Response) => {
  try {
    const analysis = await abTestService.completeTest(req.params.id);
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Complete A/B test error', err);
    res.status(500).json({ message: err.message || 'Failed to complete test' });
  }
});

router.post('/ab-tests/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { variantKey, metricName, metricValue, sampleSize } = req.body;
    if (!variantKey || !metricName || metricValue === undefined || !sampleSize) {
      return res.status(400).json({ error: 'variantKey, metricName, metricValue, and sampleSize are required' });
    }

    await abTestService.recordMetric(req.params.id, variantKey, metricName, metricValue, sampleSize);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Record metric error', err);
    res.status(500).json({ message: 'Failed to record metric' });
  }
});

router.delete('/ab-tests/:id', async (req: Request, res: Response) => {
  try {
    await abTestService.deleteTest(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete A/B test error', err);
    res.status(500).json({ message: 'Failed to delete test' });
  }
});

// ── Predictive Scoring ──

router.get('/campaigns/:id/score', async (req: Request, res: Response) => {
  try {
    let score = await predictiveScoringService.getScore(req.params.id);
    if (!score) {
      score = await predictiveScoringService.scoreCampaign(req.params.id);
    }
    res.json({ success: true, score });
  } catch (err: any) {
    console.error('Score campaign error', err);
    res.status(500).json({ message: err.message || 'Failed to score campaign' });
  }
});

router.post('/campaigns/:id/score', async (req: Request, res: Response) => {
  try {
    const score = await predictiveScoringService.scoreCampaign(req.params.id);
    res.json({ success: true, score });
  } catch (err: any) {
    console.error('Score campaign error', err);
    res.status(500).json({ message: err.message || 'Failed to score campaign' });
  }
});

router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ recommendations: [] });

    const recommendations = await predictiveScoringService.getTopRecommendations(operator.workspace_id);
    res.json({ success: true, recommendations });
  } catch (err: any) {
    console.error('Get recommendations error', err);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// ── Confidence-Based Routing ──

router.get('/routing/report', async (req: Request, res: Response) => {
  try {
    const { taskType } = req.query;
    const report = await confidenceRoutingService.getPerformanceReport(taskType as string | undefined);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error('Get routing report error', err);
    res.status(500).json({ message: 'Failed to get routing report' });
  }
});

router.get('/routing/route', async (req: Request, res: Response) => {
  try {
    const { taskType } = req.query;
    if (!taskType) return res.status(400).json({ error: 'taskType is required' });

    const decision = await confidenceRoutingService.route(taskType as string);
    res.json({ success: true, decision });
  } catch (err: any) {
    console.error('Route request error', err);
    res.status(500).json({ message: 'Failed to route request' });
  }
});

router.post('/routing/record', async (req: Request, res: Response) => {
  try {
    const { providerName, taskType, success, latencyMs, qualityScore, costCredits } = req.body;
    if (!providerName || !taskType || success === undefined || !latencyMs) {
      return res.status(400).json({ error: 'providerName, taskType, success, and latencyMs are required' });
    }

    await confidenceRoutingService.recordProviderPerformance(
      providerName,
      taskType,
      success,
      latencyMs,
      qualityScore,
      costCredits,
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('Record performance error', err);
    res.status(500).json({ message: 'Failed to record performance' });
  }
});

router.delete('/routing/reset', async (req: Request, res: Response) => {
  try {
    const { providerName, taskType } = req.query;
    await confidenceRoutingService.resetPerformance(
      providerName as string | undefined,
      taskType as string | undefined,
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('Reset performance error', err);
    res.status(500).json({ message: 'Failed to reset performance' });
  }
});

// ── Conversation Summarization ──

router.post('/memory/summarize', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const { sessionId } = req.body;
    const result = await conversationSummarizer.summarizeConversation(operator.workspace_id, sessionId);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error('Summarize conversation error', err);
    res.status(500).json({ message: 'Failed to summarize conversation' });
  }
});

router.get('/memory/summary', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ summary: null });

    const { sessionId } = req.query;
    const summary = await conversationSummarizer.getConversationSummary(
      operator.workspace_id,
      sessionId as string | undefined,
    );
    res.json({ success: true, summary });
  } catch (err: any) {
    console.error('Get summary error', err);
    res.status(500).json({ message: 'Failed to get summary' });
  }
});

router.get('/memory/should-summarize', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ shouldSummarize: false });

    const { sessionId } = req.query;
    const should = await conversationSummarizer.shouldSummarize(
      operator.workspace_id,
      sessionId as string | undefined,
    );
    res.json({ success: true, shouldSummarize: should });
  } catch (err: any) {
    console.error('Check summarization error', err);
    res.status(500).json({ message: 'Failed to check summarization' });
  }
});

// ── Preference Extraction ──

router.post('/preferences/extract', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.status(400).json({ error: 'No workspace found' });

    const result = await preferenceExtractor.extractAllPreferences(operator.workspace_id);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Extract preferences error', err);
    res.status(500).json({ message: 'Failed to extract preferences' });
  }
});

router.get('/preferences/extracted', async (req: Request, res: Response) => {
  try {
    const operator = await prisma.operator.findUnique({ where: { id: req.user!.id } });
    if (!operator?.workspace_id) return res.json({ preferences: [], patterns: [] });

    const [feedbackResult, conversationResult, campaignResult] = await Promise.all([
      preferenceExtractor.extractFromFeedback(operator.workspace_id),
      preferenceExtractor.extractFromConversations(operator.workspace_id),
      preferenceExtractor.extractFromCampaigns(operator.workspace_id),
    ]);

    res.json({
      success: true,
      preferences: [
        ...feedbackResult.preferences,
        ...conversationResult.preferences,
        ...campaignResult.preferences,
      ],
      patterns: [
        ...feedbackResult.patterns,
        ...conversationResult.patterns,
        ...campaignResult.patterns,
      ],
    });
  } catch (err: any) {
    console.error('Get extracted preferences error', err);
    res.status(500).json({ message: 'Failed to get extracted preferences' });
  }
});

export default router;
