import type { NextRequest } from 'next/server';
import { GET } from '../../../app/api/fpl-missions/export-pdf/route';
import prisma from '../../../app/utils/db';

// Mock the prisma client
jest.mock('../../../app/utils/db', () => ({
  tailboardDocument: {
    findUnique: jest.fn(),
  },
}));

// Mock the rbacMiddleware
jest.mock('../../../app/middleware/rbac', () => ({
  rbacMiddleware: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

describe('Export PDF API', () => {
  const mockSession = {
    user: { id: 'user1', role: 'ADMIN' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a PDF when given a valid document ID', async () => {
    const mockDocument = {
      id: 'doc1',
      fplMissionId: 'fpl1',
      date: new Date('2023-05-01'),
      status: 'APPROVED',
      content: JSON.stringify({
        pilotName: 'John Doe',
        site: 'Site A',
        tailboardReview: 'Tailboard review content',
        preFlightBriefing: 'Pre-flight briefing content',
        rulesReview: 'Rules review content',
        flightPlanReview: 'Flight plan review content',
        signature: 'John Doe',
      }),
    };

    (prisma.tailboardDocument.findUnique as jest.Mock).mockResolvedValue(mockDocument);

    const mockRequest = {
      url: 'http://localhost:3000/api/fpl-missions/export-pdf?id=doc1',
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="tailboard-document-doc1.pdf"');
  });

  it('returns a 404 error when the document is not found', async () => {
    (prisma.tailboardDocument.findUnique as jest.Mock).mockResolvedValue(null);

    const mockRequest = {
      url: 'http://localhost:3000/api/fpl-missions/export-pdf?id=nonexistent',
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(404);
    expect(responseData).toEqual({ error: 'Document not found' });
  });

  it('returns a 400 error when no document ID is provided', async () => {
    const mockRequest = {
      url: 'http://localhost:3000/api/fpl-missions/export-pdf',
      headers: {
        get: jest.fn().mockReturnValue(JSON.stringify(mockSession)),
      },
    } as unknown as NextRequest;

    const response = await GET(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData).toEqual({ error: 'Missing document ID' });
  });
});
