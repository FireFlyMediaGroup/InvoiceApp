import type { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function rbacMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  const token = await getToken({ req });

  if (!token) {
    // Redirect to login if there's no token
    return Response.redirect(new URL('/login', req.url));
  }

  const userRole = token.role as string;

  if (!allowedRoles.includes(userRole)) {
    // Redirect to unauthorized page if the user's role is not in the allowed roles
    return Response.redirect(new URL('/unauthorized', req.url));
  }

  // If the user has the correct role, continue to the handler
  return handler(req);
}

// Example usage:
// export default function MyProtectedRoute(req: NextRequest) {
//   return rbacMiddleware(req, actualRouteHandler, ['ADMIN', 'SUPERVISOR']);
// }
// 
// async function actualRouteHandler(req: NextRequest) {
//   // Your route logic here
//   return Response.json({ message: 'Protected data' });
// }
