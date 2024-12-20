import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/fpl-missions/route';
import prisma from '@/app/utils/db';

jest.mock('@/app/utils/db', () => ({
  fPLMission: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/app/middleware/rbac', () => ({
  rbacMiddleware: jest.fn((handler) => handler),
}));

describe('FPL Missions API', () => {
  const mockUser = { id: 'user1', role: 'USER' };
  const mockRequest = {
    headers: {
      get: jest.fn().mockReturnValue(JSON.stringify({ user: mockUser })),
    },
    json: jest.fn(),
  } as unknown as NextRequest;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('should return missions for authenticated user', async () => {
      const mockMissions = [{ id: '1', siteId: 'SITE001', status: 'DRAFT' }];
      (prisma.fPLMission.findMany as jest.Mock).mockResolvedValue(mockMissions);

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMissions);
      expect(prisma.fPLMission.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });

    it('should return all missions for ADMIN user', async () => {
      const mockAdminUser = { id: 'admin1', role: 'ADMIN' };
      const mockAdminRequest = {
        ...mockRequest,
        headers: {
          get: jest.fn().mockReturnValue(JSON.stringify({ user: mockAdminUser })),
        },
      } as unknown as NextRequest;

      const mockMissions = [{ id: '1', siteId: 'SITE001', status: 'DRAFT' }];
      (prisma.fPLMission.findMany as jest.Mock).mockResolvedValue(mockMissions);

      const response = await GET(mockAdminRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMissions);
      expect(prisma.fPLMission.findMany).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('POST', () => {
    it('should create a new mission for authenticated user', async () => {
      const newMission = { siteId: 'SITE002', status: 'DRAFT' };
      const createdMission = { id: '2', ...newMission, userId: mockUser.id };
      (mockRequest.json as jest.Mock).mockResolvedValue(newMission);
      (prisma.fPLMission.create as jest.Mock).mockResolvedValue(createdMission);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMission);
      expect(prisma.fPLMission.create).toHaveBeenCalledWith({
        data: { ...newMission, userId: mockUser.id },
      });
    });

    it('should return 400 for invalid mission data', async () => {
      const invalidMission = { siteId: '', status: 'INVALID_STATUS' };
      (mockRequest.json as jest.Mock).mockResolvedValue(invalidMission);

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('PUT', () => {
    it('should update an existing mission for authenticated user', async () => {
      const updatedMission = { id: '1', siteId: 'SITE001', status: 'PENDING' };
      (mockRequest.json as jest.Mock).mockResolvedValue(updatedMission);
      (prisma.fPLMission.findUnique as jest.Mock).mockResolvedValue({ ...updatedMission, userId: mockUser.id });
      (prisma.fPLMission.update as jest.Mock).mockResolvedValue(updatedMission);

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMission);
      expect(prisma.fPLMission.update).toHaveBeenCalledWith({
        where: { id: updatedMission.id },
        data: { siteId: updatedMission.siteId, status: updatedMission.status },
      });
    });

    it('should return 403 when trying to update a mission that does not belong to the user', async () => {
      const updatedMission = { id: '1', siteId: 'SITE001', status: 'PENDING' };
      (mockRequest.json as jest.Mock).mockResolvedValue(updatedMission);
      (prisma.fPLMission.findUnique as jest.Mock).mockResolvedValue({ ...updatedMission, userId: 'otherUser' });

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });
  });

  describe('DELETE', () => {
    it('should delete an existing mission for authenticated user', async () => {
      const missionToDelete = { id: '1' };
      (mockRequest.json as jest.Mock).mockResolvedValue(missionToDelete);
      (prisma.fPLMission.findUnique as jest.Mock).mockResolvedValue({ ...missionToDelete, userId: mockUser.id });
      (prisma.fPLMission.delete as jest.Mock).mockResolvedValue(missionToDelete);

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Mission deleted successfully');
      expect(prisma.fPLMission.delete).toHaveBeenCalledWith({
        where: { id: missionToDelete.id },
      });
    });

    it('should return 403 when trying to delete a mission that does not belong to the user', async () => {
      const missionToDelete = { id: '1' };
      (mockRequest.json as jest.Mock).mockResolvedValue(missionToDelete);
      (prisma.fPLMission.findUnique as jest.Mock).mockResolvedValue({ ...missionToDelete, userId: 'otherUser' });

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });
  });
});
