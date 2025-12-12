jest.mock('../../common/prisma', () => ({
  prisma: {
    load: { count: jest.fn(), groupBy: jest.fn() },
    invoice: { aggregate: jest.fn(), findMany: jest.fn() },
  },
}));

import request from 'supertest';
import app from '../../main';
import { prisma } from '../../common/prisma';
import { signAccessToken } from '../../common/auth';

const token = signAccessToken({ id: 'u1', tenantId: 't1', role: 'ADMIN' });

describe('Analytics summary', () => {
  beforeEach(() => {
    (prisma.load.count as jest.Mock).mockResolvedValue(3);
    (prisma.load.groupBy as jest.Mock).mockResolvedValue([{ status: 'DRAFT', _count: 1 }]);
    (prisma.invoice.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 1000 } });
    (prisma.invoice.findMany as jest.Mock).mockResolvedValue([]);
  });

  it('returns summary payload', async () => {
    const res = await request(app).get('/api/v1/analytics/summary').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalLoads).toBe(3);
  });
});
