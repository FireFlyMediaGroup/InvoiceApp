import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitorRoleBasedAccess } from '../utils/monitoring';

export function rbacMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  const rbacHandler = async (request: NextRequest) => {
    try {
      console.log('[RBAC] Middleware started');
      console.log('[RBAC] Request headers:', request.headers);
      
      const userInfoHeader = request.headers.get('X-User-Info');
      console.log('[RBAC] X-User-Info header:', userInfoHeader);

      let session;
      try {
        session = JSON.parse(userInfoHeader || '{}');
      } catch (error) {
        console.error('[RBAC] Error parsing X-User-Info header:', error);
        return new NextResponse(JSON.stringify({ error: 'Invalid user info' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      console.log('[RBAC] Parsed session:', session);

      if (!session || !session.user) {
        console.log('[RBAC] Unauthorized: No session or user');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userRole = session.user.role;
      console.log('[RBAC] User role:', userRole);

      if (!allowedRoles.includes(userRole)) {
        console.log('[RBAC] Forbidden: User role not in allowed roles');
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('[RBAC] Access granted, calling handler');
      return await handler(request);
    } catch (error) {
      console.error('[RBAC] Error in middleware or handler:', error);
      return new NextResponse(JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };

  return monitorRoleBasedAccess(rbacHandler);
}
