import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { encrypt } from '../config/encryption';
import { ApolloService } from '../services/apollo.service';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const dbTools = await (prisma as any).tool.findMany({
      orderBy: { name: 'asc' }
    });
    // Map tool_id to id for frontend compatibility
    const tools = dbTools.map((t: any) => ({
      ...t,
      id: t.tool_id
    }));
    res.json({ tools });
  } catch (err) {
    console.error('Fetch tools error', err);
    res.status(500).json({ message: 'Failed to fetch tools from database' });
  }
});

router.use(requireAuth);

router.get('/apollo/status', async (req: Request, res: Response) => {
  const clientAccountId = req.query.clientAccountId as string;
  if (!clientAccountId) {
    res.status(400).json({ success: false, error: 'clientAccountId is required' });
    return;
  }

  try {
    const apolloService = new ApolloService();
    const result = await apolloService.validateConnection(clientAccountId);
    res.json(result);
  } catch (error: any) {
    res.json({ success: false, error: error.message || 'Failed to validate Apollo connection' });
  }
});

router.get('/accounts/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  try {
    const accounts = await prisma.clientToolAccount.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        client_id: true,
        tool_name: true,
        account_label: true,
        created_by_operator_id: true,
        created_at: true
      }
    });
    res.json({ accounts });
  } catch (err) {
    console.error('List tool accounts error', err);
    res.status(500).json({ message: 'Failed to fetch tool accounts' });
  }
});

router.post('/accounts', async (req: Request, res: Response) => {
  const { clientId, toolName, accountLabel, apiKey } = req.body as {
    clientId: string;
    toolName: string;
    accountLabel: string;
    apiKey: string;
  };

  if (!clientId || !toolName || !accountLabel || !apiKey) {
    res.status(400).json({ message: 'clientId, toolName, accountLabel and apiKey are required' });
    return;
  }

  try {
    const encryptedKey = encrypt(apiKey);
    const account = await prisma.clientToolAccount.create({
      data: {
        client_id: clientId,
        tool_name: toolName,
        account_label: accountLabel,
        api_key_encrypted: encryptedKey,
        created_by_operator_id: req.user!.id
      },
      select: {
        id: true,
        client_id: true,
        tool_name: true,
        account_label: true,
        created_by_operator_id: true,
        created_at: true
      }
    });
    res.status(201).json({ account });
  } catch (err) {
    console.error('Create tool account error', err);
    res.status(500).json({ message: 'Failed to create tool account' });
  }
});

router.delete('/accounts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.clientToolAccount.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
       res.status(404).json({ message: 'Tool account not found' });
       return;
    }
    console.error('Delete tool account error', err);
    res.status(500).json({ message: 'Failed to delete tool account' });
  }
});

export default router;

