import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const brand = await prisma.brandBrain.findUnique({
      where: { client_id: clientId },
    });
    res.json({ brand: brand || { client_id: clientId, name: '', data_text: '' } });
  } catch (err: any) {
    console.error('Fetch brand brain error', err);
    res.status(500).json({ message: 'Failed to fetch brand brain' });
  }
});

router.put('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { name, data_text } = req.body as { name?: string; data_text?: string };
    const brand = await prisma.brandBrain.upsert({
      where: { client_id: clientId },
      create: { client_id: clientId, name: name || 'Default Brand Profile', data_text: data_text || '' },
      update: { name: name ?? undefined, data_text: data_text ?? undefined },
    });
    res.json({ brand });
  } catch (err: any) {
    console.error('Upsert brand brain error', err);
    res.status(500).json({ message: 'Failed to save brand brain' });
  }
});

router.delete('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    await prisma.brandBrain.delete({ where: { client_id: clientId } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Brand brain not found' });
      return;
    }
    console.error('Delete brand brain error', err);
    res.status(500).json({ message: 'Failed to delete brand brain' });
  }
});

export default router;
