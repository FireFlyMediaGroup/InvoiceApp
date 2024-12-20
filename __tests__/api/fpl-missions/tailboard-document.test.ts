import type { NextRequest } from 'next/server';
import { POST, PUT, GET } from '../../../app/api/fpl-missions/tailboard-document/route';
import prisma from '../../../app/utils/db';

// Mock the prisma client
jest.mock('../../../app/utils/db', () => ({
  tailboardDocument: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

// Mock the rbacMiddleware
jest.mock('../../../app/middleware/rbac', () => ({
  rbacMiddleware: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

describe('Tailboard Document API', () => {
  const mockSession = {
    user: { id: 'user1', role: 'ADMIN' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/fpl-missions/tailboard-document', () => {
    it('creates a new tailboard document', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          content: { title: 'Test Tailboard' },
          fplMissionId: 'fpl1',
          date: '2023-05-01',
        }),
        headers: {
          get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
        },
      } as unknown as NextRequest;

      const mockCreatedDocument = { id: 'doc1', status: 'DRAFT' };
      (prisma.tailboardDocument.create as jest.Mock).mockResolvedValue(mockCreatedDocument);

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual(mockCreatedDocument);
      expect(prisma.tailboardDocument.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          content: JSON.stringify({ title: 'Test Tailboard' }),
          fplMissionId: 'fpl1',
          date: expect.any(Date),
          status: 'DRAFT',
        }),
      });
    });
  });

  describe('PUT /api/fpl-missions/tailboard-document/[id]', () => {
    it('updates an existing tailboard document', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          content: { title: 'Updated Tailboard' },
          date: '2023-05-02',
          status: 'PENDING',
        }),
        headers: {
          get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
        },
        url: 'http://localhost:3000/api/fpl-missions/tailboard-document/doc1',
      } as unknown as NextRequest;

      const mockUpdatedDocument = { id: 'doc1', status: 'PENDING' };
      (prisma.tailboardDocument.update as jest.Mock).mockResolvedValue(mockUpdatedDocument);

      const response = await PUT(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockUpdatedDocument);
      expect(prisma.tailboardDocument.update).toHaveBeenCalledWith({
        where: { id: 'doc1' },
        data: expect.objectContaining({
          content: JSON.stringify({ title: 'Updated Tailboard' }),
          date: expect.any(Date),
          status: 'PENDING',
        }),
      });
    });

    it('returns 403 error when non-admin/supervisor tries to change status', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          content: { title: 'Updated Tailboard' },
          date: '2023-05-02',
          status: 'APPROVED',
        }),
        headers: {
          get: jest.fn().mockReturnValue(JSON.stringify({ user: { id: 'user1', role: 'USER' } })),
        },
        url: 'http://localhost:3000/api/fpl-missions/tailboard-document/doc1',
      } as unknown as NextRequest;

      const response = await PUT(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData).toEqual({ error: 'Unauthorized to change document status' });
    });
  });

  describe('GET /api/fpl-missions/tailboard-document', () => {
    it('retrieves tailboard documents with pagination', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
        },
        url: 'http://localhost:3000/api/fpl-missions/tailboard-document?page=1&limit=10',
      } as unknown as NextRequest;

      const mockDocuments = [{ id: 'doc1' }, { id: 'doc2' }];
      (prisma.tailboardDocument.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prisma.tailboardDocument.count as jest.Mock).mockResolvedValue(2);

      const response = await GET(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        documents: mockDocuments,
        totalPages: 1,
        currentPage: 1,
      });
      expect(prisma.tailboardDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });
  });
});
