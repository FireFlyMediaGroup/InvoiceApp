import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/fpl-missions/risk-matrix/route';
import prisma from '@/app/utils/db';
import { auth } from '@/app/utils/auth';

jest.mock('@/app/utils/db', () => ({
  riskMatrix: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/app/utils/auth', () => ({
  auth: jest.fn(),
}));

describe('Risk Matrix API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if missionId is missing', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix');
      const res = await GET(req);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Mission ID is required' });
    });

    it('returns 404 if risk matrix is not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.riskMatrix.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Risk Matrix not found' });
    });

    it('returns risk matrix if found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      const mockRiskMatrix = { id: '1', content: 'Test content' };
      (prisma.riskMatrix.findUnique as jest.Mock).mockResolvedValue(mockRiskMatrix);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockRiskMatrix);
    });
  });

  describe('POST', () => {
    it('returns 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test content', fplMissionId: '123' }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('creates a new risk matrix', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      const mockRiskMatrix = { id: '1', content: 'Test content', fplMissionId: '123', status: 'DRAFT' };
      (prisma.riskMatrix.create as jest.Mock).mockResolvedValue(mockRiskMatrix);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/risk-matrix', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test content', fplMissionId: '123' }),
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(mockRiskMatrix);
    });
  });
});
