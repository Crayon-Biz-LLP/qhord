import { Router, Request, Response } from 'express';
import { getInboxProvider } from '../integrations/inbox/registry';
import { ingestConversation } from '../services/inbox-sync.service';

// Public webhook receiver for inbound replies (no auth — verified by shared secret).
// Configure each tool's webhook URL as:
//   POST /api/webhooks/inbox/:clientId/:toolId
// and (optionally) send header `x-webhook-secret: <INBOX_WEBHOOK_SECRET>`.
const router = Router();

router.post('/:clientId/:toolId', async (req: Request, res: Response) => {
  const { clientId, toolId } = req.params;

  // optional shared-secret verification
  const requiredSecret = process.env.INBOX_WEBHOOK_SECRET;
  if (requiredSecret) {
    const provided = req.header('x-webhook-secret');
    if (provided !== requiredSecret) {
      return res.status(401).json({ success: false, error: 'Invalid webhook secret' });
    }
  }

  const provider = getInboxProvider(toolId);
  // Always ack 2xx so the source doesn't retry a payload we intentionally ignore.
  if (!provider || !provider.parseWebhook) {
    return res.status(200).json({ success: true, ignored: true });
  }

  try {
    const normalized = provider.parseWebhook(req.body, req.headers as any);
    if (!normalized) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const result = await ingestConversation(clientId, provider, normalized);
    res.status(200).json({
      success: true,
      conversationId: result.conversation.id,
      newMessages: result.newMessages,
    });
  } catch (err) {
    console.error(`[inbox-webhook] ${toolId} ingestion failed (client ${clientId}):`, err);
    // still 200 to avoid aggressive retries; failure is logged for inspection
    res.status(200).json({ success: false, error: 'Ingestion failed (logged)' });
  }
});

export default router;
