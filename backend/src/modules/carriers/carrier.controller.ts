import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';

export const carrierRouter = Router();

const carrierSchema = z.object({
  name: z.string().min(2),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  insuranceInfo: z.any().optional(),
  notes: z.string().optional(),
});

carrierRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const search = (req.query.search as string) || '';
    const where = { tenantId: req.user!.tenantId, name: { contains: search, mode: 'insensitive' } };
    const [data, total] = await Promise.all([
      prisma.carrier.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.carrier.count({ where }),
    ]);
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

carrierRouter.post('/', verifyAuth, validateBody(carrierSchema), async (req: AuthRequest, res, next) => {
  try {
    const carrier = await prisma.carrier.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json({ data: carrier });
  } catch (err) {
    next(err);
  }
});

carrierRouter.get('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const carrier = await prisma.carrier.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!carrier) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: carrier });
  } catch (err) {
    next(err);
  }
});

carrierRouter.put('/:id', verifyAuth, validateBody(carrierSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.carrier.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.carrier.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

carrierRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.carrier.deleteMany({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
