import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '../utils/auth';

type HandlerFunction = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export function rbacMiddleware(
  handler: HandlerFunction,
  allowedRoles: string[]
) {
  const rbacHandler: HandlerFunction = async (request, context) => {
    try {
      console.log('[RBAC] Middleware started');
      
      const session = await auth();
      console.log('[RBAC] Session:', session);

      if (!session || !session.user) {
        console.log('[RBAC] Unauthorized: No session');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userRole = session.user.role;
      if (!userRole) {
        console.log('[RBAC] Unauthorized: Invalid user role');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('[RBAC] User role:', userRole);

      if (!allowedRoles.includes(userRole)) {
        console.log('[RBAC] Forbidden: User role not in allowed roles');
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      console.log('[RBAC] Access granted, calling handler');
      return await handler(request, context);
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

  return rbacHandler;
}
