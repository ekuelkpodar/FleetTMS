import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from './prisma';

export type AuthUser = {
  id: string;
  tenantId: string;
  role: Role;
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

export function signAccessToken(user: AuthUser) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign(user, JWT_SECRET, { expiresIn });
}

export function signRefreshToken(userId: string) {
  const expiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
  const refreshSecret = process.env.REFRESH_SECRET || JWT_SECRET;
  const token = jwt.sign({ sub: userId }, refreshSecret, { expiresIn });
  return token;
}

export async function verifyAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Missing authorization header' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: { message: 'User inactive or not found' } });
    }
    req.user = { id: user.id, tenantId: user.tenantId, role: user.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

export function requireRoles(roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized' } });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
    return next();
  };
}
