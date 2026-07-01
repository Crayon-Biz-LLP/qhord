import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/ai-providers — list all configured providers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.aiProvider.findMany({
      orderBy: { priority: 'asc' },
      select: {
        id: true,
        name: true,
        display_name: true,
        default_model: true,
        is_active: true,
        priority: true,
        base_url: true,
        created_at: true,
      },
    });
    res.json({ providers });
  } catch (err: any) {
    console.error('Fetch AI providers error', err);
    res.status(500).json({ message: 'Failed to fetch AI providers' });
  }
});

// PUT /api/ai-providers/:name — upsert provider config
router.put('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { display_name, api_key, base_url, default_model, is_active, priority } = req.body as {
      display_name?: string;
      api_key?: string;
      base_url?: string;
      default_model?: string;
      is_active?: boolean;
      priority?: number;
    };

    const provider = await prisma.aiProvider.upsert({
      where: { name },
      create: {
        name,
        display_name: display_name || name,
        api_key_encrypted: api_key,
        default_model: default_model || 'claude-sonnet-4-20260506',
        is_active: is_active ?? true,
        priority: priority ?? 0,
        base_url,
      },
      update: {
        ...(display_name !== undefined && { display_name }),
        ...(api_key !== undefined && { api_key_encrypted: api_key }),
        ...(base_url !== undefined && { base_url }),
        ...(default_model !== undefined && { default_model }),
        ...(is_active !== undefined && { is_active }),
        ...(priority !== undefined && { priority }),
      },
    });

    res.json({ provider });
  } catch (err: any) {
    console.error('Upsert AI provider error', err);
    res.status(500).json({ message: 'Failed to save AI provider' });
  }
});

// DELETE /api/ai-providers/:name
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    await prisma.aiProvider.delete({ where: { name } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'AI provider not found' });
      return;
    }
    console.error('Delete AI provider error', err);
    res.status(500).json({ message: 'Failed to delete AI provider' });
  }
});

export default router;
