import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';

export const locationRouter = Router();

const locationSchema = z.object({
  name: z.string().min(2),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

locationRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const search = (req.query.search as string) || '';
    const where = { tenantId: req.user!.tenantId, name: { contains: search, mode: 'insensitive' as const } };
    const [data, total] = await Promise.all([
      prisma.location.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.location.count({ where }),
    ]);
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

locationRouter.post('/', verifyAuth, validateBody(locationSchema), async (req: AuthRequest, res, next) => {
  try {
    const location = await prisma.location.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json({ data: location });
  } catch (err) {
    next(err);
  }
});

locationRouter.put('/:id', verifyAuth, validateBody(locationSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.location.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.location.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

locationRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.location.deleteMany({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
