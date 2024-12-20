import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rbacMiddleware } from '../../../middleware/rbac';
import prisma from '../../../utils/db';

interface LogDetails {
  email?: string;
  error?: string;
}

function logUserAction(action: string, details: LogDetails) {
  console.log(`[User Management] ${action}:`, JSON.stringify(details, null, 2));
  // TODO: Implement more sophisticated logging (e.g., to a database or external logging service)
}

async function handleDEACTIVATE(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
  }

  try {
    const userToDeactivate = await prisma.user.findUnique({ where: { email } });

    if (!userToDeactivate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userToDeactivate.isAllowed) {
      return NextResponse.json({ error: 'User is already deactivated' }, { status: 400 });
    }

    // Check if this is the last active admin
    if (userToDeactivate.role === 'ADMIN') {
      const activeAdminCount = await prisma.user.count({ where: { role: 'ADMIN', isAllowed: true } });
      
      if (activeAdminCount === 1) {
        return NextResponse.json({ error: 'Cannot deactivate the last active admin' }, { status: 400 });
      }
    }

    const deactivatedUser = await prisma.user.update({
      where: { email },
      data: { isAllowed: false },
    });

    logUserAction('User Deactivated', { email: deactivatedUser.email });

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    logUserAction('User Deactivation Failed', { email, error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}

export const PATCH = rbacMiddleware(
  async (request: NextRequest) => handleDEACTIVATE(request),
  ['ADMIN']
);
