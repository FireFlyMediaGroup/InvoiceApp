import type { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../app/api/powra/route';
import prisma from '../../app/utils/db';

jest.mock('../../app/utils/db', () => ({
  pOWRA: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
}));

const mockNextRequest = (role: string | null = null, body: Record<string, unknown> = {}, method = 'GET', searchParams: Record<string, string> = {}) => {
  const url = new URL('http://localhost:3000/api/powra');
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const req = {
    headers: {
      get: jest.fn().mockReturnValue(JSON.stringify({ user: { role, id: 'user-id' } })),
    },
    json: jest.fn().mockResolvedValue(body),
    method,
    url,
  } as unknown as NextRequest;

  return req;
};

describe('POWRA API Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/powra', () => {
    test('should deny access for unauthenticated user', async () => {
      const req = mockNextRequest();
      const result = await GET(req);
      expect(result.status).toBe(401);
    });

    test('should allow access for authenticated user with correct role', async () => {
      const req = mockNextRequest('USER');
      (prisma.pOWRA.findMany as jest.Mock).mockResolvedValue([{ id: '123', site: 'Test Site' }]);
      (prisma.pOWRA.count as jest.Mock).mockResolvedValue(1);

      const result = await GET(req);
      expect(result.status).toBe(200);
    });

    test('should prevent access to non-existent POWRA', async () => {
      const req = mockNextRequest('USER', {}, 'GET', { id: 'non-existent' });
      (prisma.pOWRA.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await GET(req);
      expect(result.status).toBe(404);
    });
  });

  describe('POST /api/powra', () => {
    test('should deny access for unauthenticated user', async () => {
      const req = mockNextRequest(null, {}, 'POST');
      const result = await POST(req);
      expect(result.status).toBe(401);
    });

    test('should allow creation of POWRA for authenticated user with correct role', async () => {
      const powraData = {
        site: 'Test Site',
        status: 'DRAFT',
        date: new Date().toISOString(),
        time: '12:00',
        pilotName: 'John Doe',
        location: 'Test Location',
        chiefPilot: 'Jane Doe',
        hse: 'HSE Officer',
        beforeStartChecklist: ['Item 1', 'Item 2'],
        reviewNames: ['Reviewer 1'],
        reviewDates: [new Date().toISOString()],
        lessonsLearned: false,
        controlMeasures: {
          create: [
            {
              hazardNo: '1',
              measures: 'Safety measure 1',
              risk: 'L',
            },
          ],
        },
      };

      const req = mockNextRequest('USER', powraData, 'POST');
      (prisma.pOWRA.create as jest.Mock).mockResolvedValue({ id: '123', ...powraData });

      const result = await POST(req);
      expect(result.status).toBe(201);
    });

    test('should prevent XSS in POWRA creation', async () => {
      const powraData = {
        site: '<script>alert("XSS")</script>',
        status: 'DRAFT',
        date: new Date().toISOString(),
        time: '12:00',
        pilotName: 'John Doe',
        location: 'Test Location',
        chiefPilot: 'Jane Doe',
        hse: 'HSE Officer',
        beforeStartChecklist: ['Item 1', 'Item 2'],
        reviewNames: ['Reviewer 1'],
        reviewDates: [new Date().toISOString()],
        lessonsLearned: false,
        controlMeasures: {
          create: [
            {
              hazardNo: '1',
              measures: 'Safety measure 1',
              risk: 'L',
            },
          ],
        },
      };

      const req = mockNextRequest('USER', powraData, 'POST');
      await POST(req);

      expect(prisma.pOWRA.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            site: '<script>alert("XSS")</script>',
          }),
        })
      );
    });
  });

  describe('PUT /api/powra', () => {
    test('should deny access for unauthenticated user', async () => {
      const req = mockNextRequest(null, {}, 'PUT');
      const result = await PUT(req);
      expect(result.status).toBe(401);
    });

    test('should allow update of POWRA for authenticated user with correct role', async () => {
      const powraData = {
        site: 'Updated Test Site',
      };

      const req = mockNextRequest('USER', powraData, 'PUT', { id: '123' });
      (prisma.pOWRA.update as jest.Mock).mockResolvedValue({ id: '123', ...powraData });

      const result = await PUT(req);
      expect(result.status).toBe(200);
    });

    test('should prevent update of non-existent POWRA', async () => {
      const req = mockNextRequest('USER', {}, 'PUT', { id: 'non-existent' });
      (prisma.pOWRA.update as jest.Mock).mockRejectedValue(new Error('POWRA not found'));

      const result = await PUT(req);
      expect(result.status).toBe(404);
    });
  });

  describe('DELETE /api/powra', () => {
    test('should deny access for unauthenticated user', async () => {
      const req = mockNextRequest(null, {}, 'DELETE');
      const result = await DELETE(req);
      expect(result.status).toBe(401);
    });

    test('should allow deletion of POWRA for authenticated user with correct role', async () => {
      const req = mockNextRequest('SUPERVISOR', {}, 'DELETE', { id: '123' });
      (prisma.pOWRA.delete as jest.Mock).mockResolvedValue({ id: '123' });

      const result = await DELETE(req);
      expect(result.status).toBe(200);
    });

    test('should prevent deletion of non-existent POWRA', async () => {
      const req = mockNextRequest('SUPERVISOR', {}, 'DELETE', { id: 'non-existent' });
      (prisma.pOWRA.delete as jest.Mock).mockRejectedValue(new Error('POWRA not found'));

      const result = await DELETE(req);
      expect(result.status).toBe(404);
    });
  });
});
