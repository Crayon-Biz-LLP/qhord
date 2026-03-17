import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { ClientToolAccount } from '../types';
import { encrypt } from '../config/encryption';

const router = Router();

router.use(requireAuth);

router.get('/accounts/:clientId', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  try {
    const result = await query<ClientToolAccount>(
      'SELECT * FROM client_tool_accounts WHERE client_id = $1 ORDER BY created_at DESC',
      [clientId]
    );
    const sanitized = result.rows.map((row) => ({
      ...row,
      api_key_encrypted: undefined
    }));
    res.json({ accounts: sanitized });
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
    const result = await query<ClientToolAccount>(
      'INSERT INTO client_tool_accounts (client_id, tool_name, account_label, api_key_encrypted, created_by_operator_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clientId, toolName, accountLabel, encryptedKey, req.user!.id]
    );
    const account = result.rows[0];
    res.status(201).json({
      account: {
        ...account,
        api_key_encrypted: undefined
      }
    });
  } catch (err) {
    console.error('Create tool account error', err);
    res.status(500).json({ message: 'Failed to create tool account' });
  }
});

router.delete('/accounts/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query<ClientToolAccount>('DELETE FROM client_tool_accounts WHERE id = $1 RETURNING id', [
      id
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Tool account not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete tool account error', err);
    res.status(500).json({ message: 'Failed to delete tool account' });
  }
});

export default router;

