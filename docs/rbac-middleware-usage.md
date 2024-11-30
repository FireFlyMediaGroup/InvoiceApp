# RBAC Middleware Implementation and Usage Guide

## Overview

This document provides an overview of the Role-Based Access Control (RBAC) middleware implementation in our application and instructions on how to use it to protect routes and resources.

## Middleware Implementation

The RBAC middleware is implemented in the file `app/middleware/rbac.ts`. It provides a flexible way to apply role-based access control to our API routes.

### Key Components

1. `rbacMiddleware` function: This is the main middleware function that checks the user's role against the allowed roles for a particular route.

2. `getToken` function: Used to retrieve the user's session token from the request.

3. Allowed roles: An array of role strings that specifies which roles are permitted to access the route.

## Usage Instructions

To use the RBAC middleware in your API routes, follow these steps:

1. Import the middleware in your API route file:

```typescript
import { rbacMiddleware } from '@/app/middleware/rbac';
```

2. Wrap your route handler with the rbacMiddleware function:

```typescript
export const GET = (request: NextRequest) =>
  rbacMiddleware(request, () => handleGET(request), ['USER', 'SUPERVISOR', 'ADMIN']);
```

3. Specify the allowed roles for the route as the third argument to rbacMiddleware.

### Example

Here's an example of how to use the RBAC middleware in a route file:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rbacMiddleware } from '@/app/middleware/rbac';

async function handleGET(request: NextRequest) {
  // Your route logic here
  return NextResponse.json({ message: 'Protected data' });
}

export const GET = (request: NextRequest) =>
  rbacMiddleware(request, () => handleGET(request), ['ADMIN', 'SUPERVISOR']);
```

In this example, only users with the 'ADMIN' or 'SUPERVISOR' role will be able to access this GET route.

## Best Practices

1. Always use the RBAC middleware for routes that require role-based protection.
2. Be specific with the allowed roles. Only include the roles that absolutely need access to the route.
3. For routes that all authenticated users should access, include all roles: ['USER', 'SUPERVISOR', 'ADMIN'].
4. Remember to update the allowed roles if new roles are added to the system in the future.
5. Combine the RBAC middleware with other security measures like input validation and output sanitization for comprehensive security.

## Troubleshooting

If you encounter issues with the RBAC middleware:

1. Ensure that the user's role is correctly set in the session/token.
2. Check that the roles specified in the middleware match the roles defined in your system.
3. Verify that the middleware is correctly imported and applied to the route.

For any persistent issues, consult the error logs or contact the development team for assistance.
