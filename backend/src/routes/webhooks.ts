import { Router, Request, Response } from 'express';
import { campaignWorkflowEngine } from '../services/campaign-workflow.engine';

const router = Router();

// ── POST /api/webhooks/apollo ─────────────────────────────────
router.post('/apollo', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('[WebhookRouter] Received Apollo webhook event:', payload.event_type || 'unknown');

    const email = payload.contact?.email || payload.email || payload.lead?.email;
    const eventType = payload.event_type || 'Apollo: email_replied';

    if (email) {
      await campaignWorkflowEngine.resumeWorkflowRunOnEvent(email, eventType, payload);
    }

    res.json({ success: true, message: 'Apollo webhook processed' });
  } catch (error) {
    console.error('[WebhookRouter] Apollo webhook error:', error);
    res.status(200).json({ success: false, error: 'Failed to process' }); // Ack to avoid retries
  }
});

// ── POST /api/webhooks/smartlead ──────────────────────────────
router.post('/smartlead', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('[WebhookRouter] Received Smartlead webhook event:', payload.event_type || 'unknown');

    const email = payload.lead?.email || payload.email;
    const eventType = payload.event_type || 'Smartlead: email_replied';

    if (email) {
      await campaignWorkflowEngine.resumeWorkflowRunOnEvent(email, eventType, payload);
    }

    res.json({ success: true, message: 'Smartlead webhook processed' });
  } catch (error) {
    console.error('[WebhookRouter] Smartlead webhook error:', error);
    res.status(200).json({ success: false, error: 'Failed to process' });
  }
});

// ── POST /api/webhooks/heyreach ───────────────────────────────
router.post('/heyreach', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('[WebhookRouter] Received HeyReach webhook event:', payload.event || 'unknown');

    const email = payload.lead?.email || payload.email;
    const eventType = payload.event || 'HeyReach: linkedin_replied';

    if (email) {
      await campaignWorkflowEngine.resumeWorkflowRunOnEvent(email, eventType, payload);
    }

    res.json({ success: true, message: 'HeyReach webhook processed' });
  } catch (error) {
    console.error('[WebhookRouter] HeyReach webhook error:', error);
    res.status(200).json({ success: false, error: 'Failed to process' });
  }
});

// ── POST /api/webhooks/calendly ───────────────────────────────
router.post('/calendly', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const event = payload.event;
    console.log('[WebhookRouter] Received Calendly webhook event:', event || 'unknown');

    const invitee = payload.payload?.invitee || payload.invitee;
    const email = invitee?.email || payload.email;
    const eventType = event || 'Calendly: meeting_booked';

    if (email) {
      await campaignWorkflowEngine.resumeWorkflowRunOnEvent(email, eventType, payload);
    }

    res.json({ success: true, message: 'Calendly webhook processed' });
  } catch (error) {
    console.error('[WebhookRouter] Calendly webhook error:', error);
    res.status(200).json({ success: false, error: 'Failed to process' });
  }
});

export default router;
