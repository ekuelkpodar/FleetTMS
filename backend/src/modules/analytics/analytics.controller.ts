import { Router } from 'express';
import { subMonths, startOfMonth } from 'date-fns';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';

export const analyticsRouter = Router();

analyticsRouter.get('/summary', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const tenantId = req.user!.tenantId;
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const totalLoads = await prisma.load.count({ where: { tenantId, createdAt: { gte: last30 } } });
    const loadsByStatus = await prisma.load.groupBy({ by: ['status'], where: { tenantId }, _count: true });
    const revenueByMonth = [] as { month: string; total: number }[];
    for (let i = 5; i >= 0; i -= 1) {
      const start = startOfMonth(subMonths(new Date(), i));
      const end = startOfMonth(subMonths(new Date(), i - 1));
      const invoices = await prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { tenantId, issuedAt: { gte: start, lt: end } },
      });
      revenueByMonth.push({ month: start.toISOString().slice(0, 7), total: Number(invoices._sum.amount || 0) });
    }
    const topCustomers = await prisma.invoice.findMany({
      where: { tenantId },
      include: { billedToCustomer: true },
      orderBy: { amount: 'desc' },
      take: 5,
    });
    res.json({ totalLoads, loadsByStatus, revenueByMonth, topCustomers });
  } catch (err) {
    next(err);
  }
});
