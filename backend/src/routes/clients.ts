import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { created_by_operator_id: req.user!.id },
      orderBy: { created_at: 'desc' }
    });
    res.json({ clients });
  } catch (err) {
    console.error('List clients error', err);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { name, description, region, account_owner, industry, status, website, priority } = req.body as any;
  if (!name) {
    res.status(400).json({ message: 'name is required' });
    return;
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        description: description ?? null,
        region: region ?? null,
        account_owner: account_owner ?? null,
        industry: industry ?? null,
        status: status ?? 'Active',
        website: website ?? null,
        priority: priority ?? 'Medium',
        created_by_operator_id: req.user!.id
      }
    });
    res.status(201).json({ client });
  } catch (err) {
    console.error('Create client error', err);
    res.status(500).json({ message: 'Failed to create client' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findFirst({
      where: {
        id,
        created_by_operator_id: req.user!.id
      }
    });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.json({ client });
  } catch (err) {
    console.error('Get client error', err);
    res.status(500).json({ message: 'Failed to fetch client' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, region, account_owner, industry, status, website, priority } = req.body as any;

  try {
    const existing = await prisma.client.findFirst({
      where: {
        id,
        created_by_operator_id: req.user!.id
      }
    });
    
    if (!existing) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        region: region !== undefined ? region : undefined,
        account_owner: account_owner !== undefined ? account_owner : undefined,
        industry: industry !== undefined ? industry : undefined,
        status: status !== undefined ? status : undefined,
        website: website !== undefined ? website : undefined,
        priority: priority !== undefined ? priority : undefined
      }
    });
    res.json({ client });
  } catch (err) {
    console.error('Update client error', err);
    res.status(500).json({ message: 'Failed to update client' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await prisma.client.findFirst({
      where: {
        id,
        created_by_operator_id: req.user!.id
      }
    });
    
    if (!existing) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    await prisma.client.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (err) {
    console.error('Delete client error', err);
    res.status(500).json({ message: 'Failed to delete client' });
  }
});

export default router;

