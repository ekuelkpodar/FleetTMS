import { Router } from 'express';
import { prisma } from '../../common/prisma';
import { verifyAuth, requireRoles, AuthRequest } from '../../common/auth';
import { Role } from '@prisma/client';

export const tenantRouter = Router();

tenantRouter.get('/', verifyAuth, requireRoles([Role.ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true, domain: true, createdAt: true } });
    res.json({ data: tenants });
  } catch (err) {
    next(err);
  }
});

tenantRouter.get('/current', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId } });
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
});
