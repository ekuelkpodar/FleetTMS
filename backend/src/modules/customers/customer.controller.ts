import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';

export const customerRouter = Router();

const customerSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

customerRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const search = (req.query.search as string) || '';
    const where = {
      tenantId: req.user!.tenantId,
      name: { contains: search, mode: 'insensitive' as const },
    };
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

customerRouter.post('/', verifyAuth, validateBody(customerSchema), async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.create({ data: { ...req.body, tenantId: req.user!.tenantId } });
    res.status(201).json({ data: customer });
  } catch (err) {
    next(err);
  }
});

customerRouter.get('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!customer) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: customer });
  } catch (err) {
    next(err);
  }
});

customerRouter.put('/:id', verifyAuth, validateBody(customerSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.customer.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.customer.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

customerRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.customer.deleteMany({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
