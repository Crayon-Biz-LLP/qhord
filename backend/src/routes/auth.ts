import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateToken, hashPassword, verifyPassword, requireAuth } from '../middleware/auth';
import { AuthTokenPayload, Operator } from '../types';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

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
    const existing = await prisma.operator.findUnique({
      where: { email }
    });
    
    if (existing) {
      res.status(409).json({ message: 'Operator with this email already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'admin' ? 'admin' : 'operator';

    const operator = await prisma.operator.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        role: userRole
      }
    });

    const payload: AuthTokenPayload = {
      id: operator.id,
      email: operator.email,
      role: operator.role as any
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
    const operator = await prisma.operator.findUnique({
      where: { email }
    });

    if (!operator) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const valid = await verifyPassword(password, operator.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const operatorWithSettings = await (prisma as any).operator.findUnique({
      where: { id: operator.id },
      include: { settings: true }
    });

    if (operatorWithSettings?.settings?.two_factor_enabled) {
      res.json({ mfaRequired: true, userId: operator.id });
      return;
    }

    const payload: AuthTokenPayload = {
      id: operator.id,
      email: operator.email,
      role: operator.role as any
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
    const operator = await prisma.operator.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    });

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

router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { name, email } = req.body as { name?: string; email?: string };

  try {
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    const operator = await prisma.operator.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    });

    res.json({ message: 'Profile updated successfully', operator });
  } catch (err) {
    console.error('Update profile error', err);
    res.status(500).json({ message: 'Failed to update operator profile' });
  }
});

router.put('/change-password', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'currentPassword and newPassword are required' });
    return;
  }

  try {
    const operator = await prisma.operator.findUnique({
      where: { id: req.user.id }
    });

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    const valid = await verifyPassword(currentPassword, operator.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.operator.update({
      where: { id: req.user.id },
      data: { password_hash: passwordHash }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

router.post('/2fa/setup', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const secret = speakeasy.generateSecret({
      name: `Qhord:${req.user.email}`,
    });

    // Save secret to operator temporarily (or update)
    await (prisma as any).operator.update({
      where: { id: req.user.id },
      data: { two_factor_secret: secret.base32 }
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    res.json({
      qrCodeUrl,
      secret: secret.base32
    });
  } catch (err) {
    console.error('2FA setup error', err);
    res.status(500).json({ message: 'Failed to setup 2FA' });
  }
});

router.post('/2fa/verify', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Token is required' });
    return;
  }

  try {
    const operator = await prisma.operator.findUnique({
      where: { id: req.user.id }
    });

    if (!operator || !(operator as any).two_factor_secret) {
      res.status(400).json({ message: '2FA not set up' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: (operator as any).two_factor_secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      // Enable 2FA in settings
      await (prisma as any).operatorSettings.update({
        where: { operator_id: req.user.id },
        data: { two_factor_enabled: true }
      });

      res.json({ message: '2FA verified and enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (err) {
    console.error('2FA verify error', err);
    res.status(500).json({ message: 'Failed to verify 2FA' });
  }
});

router.post('/2fa/login-verify', async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    res.status(400).json({ message: 'userId and token are required' });
    return;
  }

  try {
    const operator = await prisma.operator.findUnique({
      where: { id: userId }
    });

    if (!operator || !(operator as any).two_factor_secret) {
      res.status(400).json({ message: '2FA not set up' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: (operator as any).two_factor_secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      const payload: AuthTokenPayload = {
        id: operator.id,
        email: operator.email,
        role: operator.role as any
      };
      const authToken = generateToken(payload);

      res.json({ token: authToken, operator: payload });
    } else {
      res.status(401).json({ message: 'Invalid 2FA token' });
    }
  } catch (err) {
    console.error('2FA login verify error', err);
    res.status(500).json({ message: 'Failed to verify 2FA' });
  }
});

export default router;
