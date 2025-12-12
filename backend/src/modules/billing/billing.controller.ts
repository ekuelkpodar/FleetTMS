import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest, requireRoles } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { Role, InvoiceStatus } from '@prisma/client';

export const billingRouter = Router();

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(2),
  billedToCustomerId: z.string().optional(),
  amount: z.number(),
  currency: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

billingRouter.get('/invoices', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({ where: { tenantId: req.user!.tenantId }, include: { load: true } });
    res.json({ data: invoices });
  } catch (err) {
    next(err);
  }
});

billingRouter.post('/loads/:id/invoices', verifyAuth, requireRoles([Role.ADMIN, Role.ACCOUNTING]), validateBody(invoiceSchema), async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!load) return res.status(404).json({ error: { message: 'Load not found' } });
    const invoice = await prisma.invoice.create({
      data: {
        loadId: load.id,
        tenantId: req.user!.tenantId,
        invoiceNumber: req.body.invoiceNumber,
        billedToCustomerId: req.body.billedToCustomerId || load.customerId,
        amount: req.body.amount,
        currency: req.body.currency || load.currency,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        status: req.body.status || InvoiceStatus.DRAFT,
      },
    });
    res.status(201).json({ data: invoice });
  } catch (err) {
    next(err);
  }
});

billingRouter.put('/invoices/:id', verifyAuth, requireRoles([Role.ADMIN, Role.ACCOUNTING]), validateBody(invoiceSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.invoice.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: req.body });
    if (!updated.count) return res.status(404).json({ error: { message: 'Invoice not found' } });
    const data = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
