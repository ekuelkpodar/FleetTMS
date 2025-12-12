import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';

export const equipmentRouter = Router();

const equipmentSchema = z.object({
  type: z.string(),
  trailerNumber: z.string().optional(),
  plateNumber: z.string().optional(),
  capacityWeight: z.number().int().optional(),
  capacityVolume: z.number().int().optional(),
  notes: z.string().optional(),
});

equipmentRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const data = await prisma.equipment.findMany({
      where: { tenantId: req.user!.tenantId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.equipment.count({ where: { tenantId: req.user!.tenantId } });
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

equipmentRouter.post('/', verifyAuth, validateBody(equipmentSchema), async (req: AuthRequest, res, next) => {
  try {
    const equipment = await prisma.equipment.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json({ data: equipment });
  } catch (err) {
    next(err);
  }
});

equipmentRouter.put('/:id', verifyAuth, validateBody(equipmentSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.equipment.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.equipment.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

equipmentRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.equipment.deleteMany({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
