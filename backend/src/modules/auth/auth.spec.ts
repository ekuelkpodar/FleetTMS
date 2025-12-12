import request from 'supertest';
import bcrypt from 'bcryptjs';

jest.mock('../../common/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      tenant: {
        create: jest.fn(),
      },
    },
  };
});

const { prisma } = jest.requireMock('../../common/prisma');

import app from '../../main';

describe('Auth routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 on invalid credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('Password123!', 10),
      tenantId: 't1',
      role: 'ADMIN',
      isActive: true,
    });
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'bad' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/Invalid credentials/);
  });
});
