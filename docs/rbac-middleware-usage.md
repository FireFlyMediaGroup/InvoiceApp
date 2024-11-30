# RBAC Middleware Usage Guide

## Overview

This document provides instructions on how to use the Role-Based Access Control (RBAC) middleware in our application. The RBAC middleware is designed to protect routes and ensure that only users with the appropriate roles can access certain parts of the application.

## Middleware Implementation

The RBAC middleware is implemented in the `app/middleware/rbac.ts` file. It uses the user's role information stored in the session to determine if the user has the necessary permissions to access a particular route.

## How to Use the RBAC Middleware

1. Import the middleware in your route file:

```typescript
import { rbacMiddleware } from '@/app/middleware/rbac';
```

2. Apply the middleware to your route handler:

```typescript
export async function GET(req: NextRequest) {
  const result = await rbacMiddleware(req, ['ADMIN', 'SUPERVISOR']);
  if (result instanceof NextResponse) {
    return result; // This is an error response, return it
  }
  
  // Your route logic here
}
```

3. The middleware takes two parameters:
   - The incoming request object
   - An array of allowed roles for this route

4. If the user's role is not in the allowed roles array, the middleware will return an unauthorized response. Otherwise, it will allow the request to proceed.

## Example Usage

Here's an example of how to use the RBAC middleware in different scenarios:

### Admin-only route

```typescript
export async function POST(req: NextRequest) {
  const result = await rbacMiddleware(req, ['ADMIN']);
  if (result instanceof NextResponse) {
    return result;
  }
  
  // Admin-only logic here
}
```

### Route accessible by both Supervisors and Admins

```typescript
export async function GET(req: NextRequest) {
  const result = await rbacMiddleware(req, ['ADMIN', 'SUPERVISOR']);
  if (result instanceof NextResponse) {
    return result;
  }
  
  // Logic for Supervisors and Admins
}
```

### Route accessible by all authenticated users

```typescript
export async function GET(req: NextRequest) {
  const result = await rbacMiddleware(req, ['ADMIN', 'SUPERVISOR', 'USER']);
  if (result instanceof NextResponse) {
    return result;
  }
  
  // Logic for all authenticated users
}
```

## Best Practices

1. Always apply the RBAC middleware to routes that require role-based access control.
2. Use the principle of least privilege: only grant the minimum required access for each route.
3. Keep the allowed roles array up-to-date if new roles are added to the system.
4. Combine the RBAC middleware with other security measures like input validation and output encoding.
5. Regularly audit the usage of RBAC middleware to ensure it's applied consistently across the application.

## Troubleshooting

If you encounter issues with the RBAC middleware:

1. Ensure that the user's role is correctly set in the session during authentication.
2. Check that the allowed roles array passed to the middleware is correct for each route.
3. Verify that the middleware is imported and applied correctly in each route file.
4. Review the server logs for any error messages related to RBAC or authentication.

By following these guidelines, you can effectively implement role-based access control across your application, ensuring that users only have access to the resources appropriate for their role.
