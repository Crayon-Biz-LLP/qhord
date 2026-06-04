import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    let { clientId } = req.query;

    if (!clientId) {
      const client = await prisma.client.findFirst({
        where: { created_by_operator_id: operatorId },
        select: { id: true },
      });
      if (!client) {
        return res.json({ success: true, messages: [] });
      }
      clientId = client.id;
    }

    const messages = await prisma.inboxMessage.findMany({
      where: { client_id: clientId as string },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Fetch inbox messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inbox messages' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const { sender, company, campaign, subject, body, tags, tool, sentiment, avatar, clientId, unread } = req.body;

    if (!sender || !subject || !body || !tool) {
      return res.status(400).json({ success: false, error: 'Missing required fields: sender, subject, body, tool' });
    }

    let targetClientId = clientId;
    if (!targetClientId) {
      const client = await prisma.client.findFirst({
        where: { created_by_operator_id: operatorId },
        select: { id: true },
      });
      if (!client) {
        return res.status(400).json({ success: false, error: 'No client node established for this operator.' });
      }
      targetClientId = client.id;
    }

    const message = await prisma.inboxMessage.create({
      data: {
        sender,
        company: company || '',
        campaign: campaign || '',
        subject,
        body,
        tags: tags || [],
        tool,
        unread: unread !== undefined ? Boolean(unread) : true,
        sentiment: sentiment || 'Standard',
        avatar: avatar || sender.charAt(0),
        client_id: targetClientId,
      }
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Create inbox message error:', error);
    res.status(500).json({ success: false, error: 'Failed to create inbox message' });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { unread } = req.body;

    const message = await prisma.inboxMessage.update({
      where: { id },
      data: {
        unread: unread !== undefined ? Boolean(unread) : false
      }
    });

    res.json({ success: true, message });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    console.error('Update inbox message error:', error);
    res.status(500).json({ success: false, error: 'Failed to update inbox message' });
  }
});

export default router;
