import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { monitorRoleBasedAccess } from '../utils/monitoring';

export function rbacMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return monitorRoleBasedAccess(async (req: NextRequest) => {
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');

    if (!session || !session.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userRole = session.user.role;

    if (!allowedRoles.includes(userRole)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler();
  })(request);
}
