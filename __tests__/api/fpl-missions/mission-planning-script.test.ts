import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/fpl-missions/mission-planning-script/route';
import prisma from '@/app/utils/db';
import { auth } from '@/app/utils/auth';

jest.mock('@/app/utils/db', () => ({
  missionPlanningScript: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/app/utils/auth', () => ({
  auth: jest.fn(),
}));

describe('Mission Planning Script API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if missionId is missing', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script');
      const res = await GET(req);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'Mission ID is required' });
    });

    it('returns 404 if mission planning script is not found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      (prisma.missionPlanningScript.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Mission Planning Script not found' });
    });

    it('returns mission planning script if found', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      const mockScript = { id: '1', content: 'Test content' };
      (prisma.missionPlanningScript.findUnique as jest.Mock).mockResolvedValue(mockScript);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script?missionId=123');
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(mockScript);
    });
  });

  describe('POST', () => {
    it('returns 401 if user is not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test content', fplMissionId: '123' }),
      });
      const res = await POST(req);

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });

    it('creates a new mission planning script', async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: '1' } });
      const mockScript = { id: '1', content: 'Test content', fplMissionId: '123', status: 'DRAFT' };
      (prisma.missionPlanningScript.create as jest.Mock).mockResolvedValue(mockScript);

      const req = new NextRequest('http://localhost:3000/api/fpl-missions/mission-planning-script', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test content', fplMissionId: '123' }),
      });
      const res = await POST(req);

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(mockScript);
    });
  });
});
