import type { NextRequest } from 'next/server';
import { GET } from '../../../app/api/fpl-missions/dashboard-stats/route';
import prisma from '../../../app/utils/db';

// Mock the prisma client
jest.mock('../../../app/utils/db', () => ({
  tailboardDocument: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
}));

// Mock the rbacMiddleware
jest.mock('../../../app/middleware/rbac', () => ({
  rbacMiddleware: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

describe('Dashboard Stats API', () => {
  const mockSession = {
    user: { id: 'user1', role: 'ADMIN' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns dashboard statistics', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
      },
    } as unknown as NextRequest;

    const mockTotalDocuments = 10;
    const mockStatusCounts = [
      { status: 'DRAFT', _count: 3 },
      { status: 'PENDING', _count: 4 },
      { status: 'APPROVED', _count: 3 },
    ];
    const mockRecentDocuments = [
      { id: 'doc1', status: 'DRAFT', createdAt: new Date(), fplMission: { siteId: 'site1' } },
      { id: 'doc2', status: 'PENDING', createdAt: new Date(), fplMission: { siteId: 'site2' } },
    ];

    (prisma.tailboardDocument.count as jest.Mock).mockResolvedValue(mockTotalDocuments);
    (prisma.tailboardDocument.groupBy as jest.Mock).mockResolvedValue(mockStatusCounts);
    (prisma.tailboardDocument.findMany as jest.Mock).mockResolvedValue(mockRecentDocuments);

    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData).toEqual({
      totalDocuments: mockTotalDocuments,
      statusCounts: {
        DRAFT: 3,
        PENDING: 4,
        APPROVED: 3,
      },
      recentDocuments: mockRecentDocuments,
    });

    expect(prisma.tailboardDocument.count).toHaveBeenCalled();
    expect(prisma.tailboardDocument.groupBy).toHaveBeenCalledWith({
      by: ['status'],
      _count: true,
    });
    expect(prisma.tailboardDocument.findMany).toHaveBeenCalledWith({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { fplMission: true },
    });
  });

  it('handles errors and returns 500 status', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
      },
    } as unknown as NextRequest;

    (prisma.tailboardDocument.count as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Internal Server Error' });
  });
});
