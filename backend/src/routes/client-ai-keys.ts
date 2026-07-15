import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { clientAiKeyService } from '../services/client-ai-key.service';

const router = Router();

router.use(requireAuth);

// GET /api/client-ai-keys/:clientId — list keys for a client
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    // Verify client belongs to this operator
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (client.created_by_operator_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const keys = await clientAiKeyService.getKeys(clientId);

    // Mask keys for security — never return full key
    const maskedKeys = keys.map((k) => ({
      ...k,
      apiKey: '****',
    }));

    res.json({ keys: maskedKeys });
  } catch (err: any) {
    console.error('Fetch client AI keys error', err);
    res.status(500).json({ message: 'Failed to fetch AI keys' });
  }
});

// POST /api/client-ai-keys/:clientId — add/update a key
router.post('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { providerName, apiKey } = req.body;

    if (!providerName || !apiKey) {
      return res.status(400).json({ error: 'providerName and apiKey are required' });
    }

    const validProviders = ['openai', 'groq', 'anthropic', 'gemini'];
    if (!validProviders.includes(providerName)) {
      return res.status(400).json({ error: `Invalid provider. Must be: ${validProviders.join(', ')}` });
    }

    // Verify client belongs to this operator
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (client.created_by_operator_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await clientAiKeyService.setKey(clientId, providerName, apiKey);

    res.json({
      success: true,
      message: `${providerName} key added successfully`,
      key: {
        ...result,
        apiKey: '****',
      },
    });
  } catch (err: any) {
    console.error('Set client AI key error', err);
    res.status(500).json({ message: 'Failed to save AI key' });
  }
});

// DELETE /api/client-ai-keys/:clientId/:providerName — delete a key
router.delete('/:clientId/:providerName', async (req: Request, res: Response) => {
  try {
    const { clientId, providerName } = req.params;

    // Verify client belongs to this operator
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (client.created_by_operator_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await clientAiKeyService.deleteKey(clientId, providerName);

    res.json({ success: true, message: `${providerName} key deleted` });
  } catch (err: any) {
    console.error('Delete client AI key error', err);
    res.status(500).json({ message: 'Failed to delete AI key' });
  }
});

// PUT /api/client-ai-keys/:clientId/:providerName/toggle — enable/disable a key
router.put('/:clientId/:providerName/toggle', async (req: Request, res: Response) => {
  try {
    const { clientId, providerName } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive (boolean) is required' });
    }

    // Verify client belongs to this operator
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    if (client.created_by_operator_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await clientAiKeyService.toggleKey(clientId, providerName, isActive);

    res.json({ success: true, message: `${providerName} key ${isActive ? 'enabled' : 'disabled'}` });
  } catch (err: any) {
    console.error('Toggle client AI key error', err);
    res.status(500).json({ message: 'Failed to toggle AI key' });
  }
});

// GET /api/client-ai-keys/:clientId/status — check which providers are connected
router.get('/:clientId/status', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const providers = ['openai', 'groq', 'anthropic', 'gemini'];
    const status: Record<string, { connected: boolean; isActive: boolean }> = {};

    for (const provider of providers) {
      const keys = await clientAiKeyService.getKeys(clientId);
      const key = keys.find((k) => k.providerName === provider);
      status[provider] = {
        connected: !!key,
        isActive: key?.isActive || false,
      };
    }

    // Check which one is the default (first available)
    const firstAvailable = await clientAiKeyService.getFirstAvailableKey(clientId);

    res.json({
      providers: status,
      defaultProvider: firstAvailable?.provider || null,
      usesPlatformKey: !firstAvailable,
    });
  } catch (err: any) {
    console.error('Check AI key status error', err);
    res.status(500).json({ message: 'Failed to check AI key status' });
  }
});

export default router;
