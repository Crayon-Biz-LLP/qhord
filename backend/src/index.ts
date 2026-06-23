import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import toolRoutes from './routes/tools';
import executionRoutes from './routes/executions';
import planRoutes from './routes/plans';
import campaignRoutes from './routes/campaigns';
import nodeStatusRoutes from './routes/node-status';
import approvalRoutes from './routes/approvals';
import campaignExecutionRoutes from './routes/execution';
import aiMetricsRoutes from './routes/ai-metrics';
import subscriptionRoutes from './routes/subscription';
import commandCenterRoutes from './routes/command-center';
import queueRoutes from './routes/queue';
import workflowRoutes from './routes/workflows';
import memoryRoutes from './routes/memory';
import settingsRoutes from './routes/settings';
import leadsRoutes from './routes/leads';
import dashboardRoutes from './routes/dashboard';
import analyticsRoutes from './routes/analytics';
import playbooksRoutes from './routes/playbooks';
import dealsRoutes from './routes/deals';
import inboxRoutes from './routes/inbox';
import unifiedInboxRoutes from './routes/unified-inbox';
import inboxWebhookRoutes from './routes/inbox-webhooks';
import webhookRoutes from './routes/webhooks';
import stripeWebhookRoutes from './routes/stripe-webhook';
import { prisma } from './lib/prisma';
import { campaignWorker } from './workers/campaign-worker';
import { workflowWorker } from './workers/workflow-worker';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://qhord.seenode.app',
  'http://localhost:3000'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    const cleanAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
    if (cleanAllowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));
// Stripe webhooks must use raw body — register BEFORE express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check error', err);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/clients', unifiedInboxRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/nodes', nodeStatusRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/execution', campaignExecutionRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api', aiMetricsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/command-center', commandCenterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/playbooks', playbooksRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/webhooks/inbox', inboxWebhookRoutes);
app.use('/api/webhooks', webhookRoutes);

// Optional: background inbox sync (BullMQ + Redis). Off by default so the app
// runs without Redis; enable with INBOX_BACKGROUND_SYNC=true.
if (process.env.INBOX_BACKGROUND_SYNC === 'true') {
  void import('./workers/inbox-sync.worker').then(({ inboxSyncWorker }) => {
    void inboxSyncWorker;
  });
  void import('./queue/inbox-queue').then(({ scheduleInboxSync }) =>
    scheduleInboxSync().catch((err) =>
      console.error('Failed to schedule inbox background sync:', err),
    ),
  );
}

const port = parseInt(process.env.PORT || '4000', 10);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});

