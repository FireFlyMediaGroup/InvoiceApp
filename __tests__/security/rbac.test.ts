import type { NextRequest } from 'next/server';
import { rbacMiddleware } from '../../app/middleware/rbac';
import { handlePOST as handleUserPost } from '../../app/api/users/route';
import prisma from '../../app/utils/db';

jest.mock('../../app/utils/db', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

// Mock the NextRequest
const mockNextRequest = (role: string | null = null, body: Record<string, unknown> = {}) => {
  return {
    headers: {
      get: jest.fn().mockReturnValue(JSON.stringify({ user: { role } })),
    },
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
};

// Mock the handler function
const mockHandler = jest.fn().mockResolvedValue({ status: 200, json: () => ({}) });

describe('RBAC Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should allow access for user with correct role', async () => {
    const req = mockNextRequest('ADMIN');
    await rbacMiddleware(req, mockHandler, ['ADMIN']);
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should deny access for user with incorrect role', async () => {
    const req = mockNextRequest('USER');
    const result = await rbacMiddleware(req, mockHandler, ['ADMIN']);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(result.status).toBe(403);
  });

  test('should deny access for unauthenticated user', async () => {
    const req = mockNextRequest();
    const result = await rbacMiddleware(req, mockHandler, ['USER']);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(result.status).toBe(401);
  });

  test('should allow access for user with any of the allowed roles', async () => {
    const req = mockNextRequest('SUPERVISOR');
    await rbacMiddleware(req, mockHandler, ['USER', 'SUPERVISOR', 'ADMIN']);
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should deny access when trying to escalate privileges', async () => {
    const req = mockNextRequest('USER');
    const result = await rbacMiddleware(req, mockHandler, ['ADMIN']);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(result.status).toBe(403);
  });

  // SQL Injection prevention test
  test('should prevent SQL injection in user creation', async () => {
    const req = mockNextRequest('ADMIN', {
      email: "test@example.com'; DROP TABLE users; --",
      role: 'USER',
      firstName: 'Test',
      lastName: 'User',
    });

    await handleUserPost(req);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "test@example.com'; DROP TABLE users; --",
      }),
    });
  });

  // XSS prevention test
  test('should prevent XSS in user creation', async () => {
    const req = mockNextRequest('ADMIN', {
      email: 'test@example.com',
      role: 'USER',
      firstName: '<script>alert("XSS")</script>',
      lastName: 'User',
    });

    await handleUserPost(req);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: '<script>alert("XSS")</script>',
      }),
    });
  });

  // Add more tests here for specific vulnerabilities or edge cases
});
