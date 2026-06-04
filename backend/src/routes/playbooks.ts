import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const playbooks = await prisma.playbook.findMany({
      orderBy: { created_at: 'asc' }
    });
    res.json({ success: true, playbooks });
  } catch (error) {
    console.error('Fetch playbooks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch playbooks' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, difficulty, description, rating, imports, confidence, deploy_time, credits, category, reply_rate } = req.body;
    if (!name || !difficulty || !description || !category) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, difficulty, description, category' });
    }
    const playbook = await prisma.playbook.create({
      data: {
        name,
        difficulty,
        description,
        category,
        rating: rating ? parseFloat(rating) : 4.5,
        imports: imports || "0",
        confidence: confidence ? parseInt(confidence, 10) : 80,
        deploy_time: deploy_time || "15 minutes",
        credits: credits ? parseInt(credits, 10) : 20,
        reply_rate: reply_rate || "8-12%",
      }
    });
    res.status(201).json({ success: true, playbook });
  } catch (error) {
    console.error('Create playbook error:', error);
    res.status(500).json({ success: false, error: 'Failed to create playbook' });
  }
});

export default router;
