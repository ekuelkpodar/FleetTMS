import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';

export const driverRouter = Router();

const driverSchema = z.object({
  carrierId: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

driverRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const search = (req.query.search as string) || '';
    const where = {
      tenantId: req.user!.tenantId,
      name: { contains: search, mode: 'insensitive' },
    };
    const [data, total] = await Promise.all([
      prisma.driver.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.driver.count({ where }),
    ]);
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

driverRouter.post('/', verifyAuth, validateBody(driverSchema), async (req: AuthRequest, res, next) => {
  try {
    const driver = await prisma.driver.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json({ data: driver });
  } catch (err) {
    next(err);
  }
});

driverRouter.get('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const driver = await prisma.driver.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!driver) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: driver });
  } catch (err) {
    next(err);
  }
});

driverRouter.put('/:id', verifyAuth, validateBody(driverSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.driver.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.driver.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

driverRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.driver.deleteMany({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
