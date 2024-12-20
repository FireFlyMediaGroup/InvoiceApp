import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rbacMiddleware } from '../../middleware/rbac';
import prisma from '../../utils/db';
import { signIn } from '../../utils/auth';

interface LogDetails {
  id?: string;
  email?: string;
  role?: string;
  newRole?: string;
  error?: string;
}

function logUserAction(action: string, details: LogDetails) {
  console.log(`[User Management] ${action}:`, JSON.stringify(details, null, 2));
  // TODO: Implement more sophisticated logging (e.g., to a database or external logging service)
}

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { email, role, firstName, lastName } = body;

  if (!email || !role || !firstName || !lastName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        role,
        firstName,
        lastName,
        isAllowed: true, // Set to true by default when created by an admin
      },
    });

    // Trigger magic link email
    await signIn('email', { email: newUser.email, redirect: false });

    logUserAction('User Created', { id: newUser.id, email: newUser.email, role: newUser.role });

    return NextResponse.json({ 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      message: 'User created and magic link sent'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    logUserAction('User Creation Failed', { email, error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

async function handlePUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { email, newRole } = body;

  if (!email || !newRole) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { email } });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this is the last admin
    if (newRole !== 'ADMIN' && currentUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      
      if (adminCount === 1) {
        return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: newRole },
    });

    logUserAction('User Role Updated', { id: updatedUser.id, email: updatedUser.email, newRole });

    return NextResponse.json({ 
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      } 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    logUserAction('User Role Update Failed', { email, newRole, error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

async function handleDEACTIVATE(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    const userToDeactivate = await prisma.user.findUnique({ where: { id } });

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
      where: { id },
      data: { isAllowed: false },
    });

    logUserAction('User Deactivated', { id: deactivatedUser.id, email: deactivatedUser.email, role: deactivatedUser.role });

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    logUserAction('User Deactivation Failed', { id, error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
}

export const POST = rbacMiddleware(
  async (request: NextRequest) => handlePOST(request),
  ['ADMIN']
);

export const PUT = rbacMiddleware(
  async (request: NextRequest) => handlePUT(request),
  ['ADMIN']
);

export const PATCH = rbacMiddleware(
  async (request: NextRequest) => handleDEACTIVATE(request),
  ['ADMIN']
);
