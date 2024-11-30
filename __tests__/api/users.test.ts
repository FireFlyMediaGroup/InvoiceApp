import { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';
import { POST, PUT } from '../../app/api/users/route';
import prisma from '../../app/utils/db';
import { signIn } from '../../app/utils/auth';

jest.mock('../../app/utils/db', () => ({
  user: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../app/utils/auth', () => ({
  signIn: jest.fn(),
}));

jest.mock('../../app/middleware/rbac', () => ({
  rbacMiddleware: jest.fn((req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => handler(req)),
}));

describe('User Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should create a new user and send a magic link', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        isAllowed: true,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (signIn as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          role: 'USER',
          firstName: 'John',
          lastName: 'Doe',
        }),
      });

      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.user).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      }));
      expect(responseData.message).toBe('User created and magic link sent');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(signIn).toHaveBeenCalledWith('email', { email: 'test@example.com', redirect: false });
    });

    it('should return an error if required fields are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing role, firstName, and lastName
        }),
      });

      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Missing required fields');
    });
  });

  describe('PUT /api/users', () => {
    it('should update a user\'s role', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'SUPERVISOR',
        firstName: 'John',
        lastName: 'Doe',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          id: '1',
          newRole: 'SUPERVISOR',
        }),
      });

      const response = await PUT(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.user).toEqual(expect.objectContaining(mockUser));
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { role: 'SUPERVISOR' },
      });
    });

    it('should return an error if required fields are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          // Missing id and newRole
        }),
      });

      const response = await PUT(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Missing required fields');
    });
  });
});
