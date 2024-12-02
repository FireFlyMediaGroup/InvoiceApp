import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitorRoleBasedAccess } from '../utils/monitoring';

export function rbacMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return monitorRoleBasedAccess(async (req: NextRequest) => {
    const userInfoHeader = req.headers.get('X-User-Info');
    console.log('[RBAC] X-User-Info header:', userInfoHeader);

    const session = JSON.parse(userInfoHeader || '{}');
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

    console.log('[RBAC] Access granted');
    return handler();
  })(request);
}
