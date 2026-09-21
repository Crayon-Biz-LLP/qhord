import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const owners = await prisma.clientOwner.findMany({
      where: { operator_id: req.user!.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.json({ success: true, owners });
  } catch (error) {
    console.error('Fetch owners error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch owners' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' });
    }
    if (name.length > 100) {
      return res.status(400).json({ success: false, error: 'name must be 100 characters or fewer' });
    }

    const operatorId = req.user!.id;
    const owner = await prisma.clientOwner.upsert({
      where: { operator_id_name: { operator_id: operatorId, name } },
      update: {},
      create: { operator_id: operatorId, name },
      select: { id: true, name: true },
    });
    res.status(201).json({ success: true, owner });
  } catch (error) {
    console.error('Create owner error:', error);
    res.status(500).json({ success: false, error: 'Failed to save owner' });
  }
});

export default router;
