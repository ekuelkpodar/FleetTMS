import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { signAccessToken, signRefreshToken, verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { Role } from '@prisma/client';

export const authRouter = Router();

const registerSchema = z.object({
  tenantName: z.string().min(2),
  domain: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { tenantName, domain, name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: { message: 'Email already in use' } });
    const passwordHash = await bcrypt.hash(password, 10);
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        domain,
        users: {
          create: { name, email, passwordHash, role: Role.ADMIN },
        },
      },
      include: { users: true },
    });
    const user = tenant.users[0];
    const accessToken = signAccessToken({ id: user.id, tenantId: tenant.id, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.status(201).json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: tenant.id } });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: { message: 'Invalid credentials' } });
    const accessToken = signAccessToken({ id: user.id, tenantId: user.tenantId, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (err) {
    next(err);
  }
});

const refreshSchema = z.object({ refreshToken: z.string() });

authRouter.post('/refresh', validateBody(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const refreshSecret = process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'supersecretjwt';
    const payload = jwt.verify(refreshToken, refreshSecret) as { sub: string };
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: { message: 'Refresh token expired' } });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: { message: 'User not found' } });
    const accessToken = signAccessToken({ id: user.id, tenantId: user.tenantId, role: user.role });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', validateBody(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', verifyAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true, tenantId: true } });
  res.json({ user });
});
