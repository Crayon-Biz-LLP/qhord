import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    let { clientId } = req.query;

    if (clientId) {
      const owned = await prisma.client.findFirst({
        where: { id: clientId as string, created_by_operator_id: operatorId },
        select: { id: true }
      });
      if (!owned) {
        return res.json({ leads: [] });
      }
    } else {
      const client = await prisma.client.findFirst({
        where: { created_by_operator_id: operatorId },
        select: { id: true }
      });
      if (!client) return res.json({ leads: [] });
      clientId = client.id;
    }

    const leads = await prisma.lead.findMany({
      where: { client_id: clientId as string },
      orderBy: { created_at: 'desc' },
      take: 200,
      include: {
        campaign: { select: { id: true, name: true } }
      }
    });

    res.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

export default router;
