import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthTokenPayload, OperatorRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

import { prisma } from '../lib/prisma';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.substring('Bearer '.length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    
    if (decoded.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId }
      });

      if (!session || session.is_revoked || session.operator_id !== decoded.id) {
        res.status(401).json({ message: 'Session expired or revoked' });
        return;
      }

      // Optionally check expires_at if it's set
      if (session.expires_at && new Date() > session.expires_at) {
        res.status(401).json({ message: 'Session expired' });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(roles: OperatorRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

const ipCache = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const now = Date.now();

    let record = ipCache.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }

    record.count++;
    ipCache.set(ip, record);

    if (record.count > maxRequests) {
      res.status(429).json({ message: 'Too many authentication attempts. Please try again later.' });
      return;
    }
    next();
  };
}


