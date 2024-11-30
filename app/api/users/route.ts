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

async function handlePOST(request: NextRequest) {
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

async function handlePUT(request: NextRequest) {
  const body = await request.json();
  const { id, newRole } = body;

  if (!id || !newRole) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
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
    logUserAction('User Role Update Failed', { id, newRole, error: (error as Error).message });
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export const POST = (request: NextRequest) =>
  rbacMiddleware(request, () => handlePOST(request), ['ADMIN']);

export const PUT = (request: NextRequest) =>
  rbacMiddleware(request, () => handlePUT(request), ['ADMIN']);
