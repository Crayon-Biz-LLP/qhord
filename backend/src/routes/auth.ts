import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { generateToken, hashPassword, verifyPassword, requireAuth } from '../middleware/auth';
import { AuthTokenPayload, Operator } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body as {
    email: string;
    password: string;
    name: string;
    role?: string;
  };

  if (!email || !password || !name) {
    res.status(400).json({ message: 'email, password and name are required' });
    return;
  }

  try {
    const existing = await query<Operator>('SELECT * FROM operators WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'Operator with this email already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'admin' ? 'admin' : 'operator';

    const inserted = await query<Operator>(
      'INSERT INTO operators (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, passwordHash, name, userRole]
    );

    const operator = inserted.rows[0];
    const payload: AuthTokenPayload = {
      id: operator.id,
      email: operator.email,
      role: operator.role
    };
    const token = generateToken(payload);

    res.status(201).json({ token, operator: payload });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Failed to register operator' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  try {
    const result = await query<Operator>('SELECT * FROM operators WHERE email = $1', [email]);
    const operator = result.rows[0];

    if (!operator) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await verifyPassword(password, operator.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload: AuthTokenPayload = {
      id: operator.id,
      email: operator.email,
      role: operator.role
    };
    const token = generateToken(payload);

    res.json({ token, operator: payload });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Failed to login' });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const result = await query<Operator>('SELECT id, email, name, role, created_at FROM operators WHERE id = $1', [
      req.user.id
    ]);
    const operator = result.rows[0];
    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }
    res.json({ operator });
  } catch (err) {
    console.error('Me error', err);
    res.status(500).json({ message: 'Failed to fetch operator' });
  }
});

export default router;

