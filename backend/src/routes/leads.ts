import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: operatorId },
      select: { id: true },
    });
    if (!client) return res.json({ leads: [] });

    const leads = await prisma.lead.findMany({
      where: { client_id: client.id },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    res.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

export default router;
