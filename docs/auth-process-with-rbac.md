# Authentication and Authorization Process with Role-Based Access Control

## Current Authentication Process

1. **Overall Structure:**
   - Uses NextAuth with a custom configuration (authConfig)
   - Utilizes PrismaAdapter for database operations
   - Implements NodemailerProvider for email-based authentication

2. **Custom Adapter and Error Handling:**
   - Implements a customPrismaAdapter to handle specific errors (e.g., P2025) during session deletion
   - Uses a customLogger function for improved error tracking and debugging

3. **Email Verification Process:**
   - Validates email configuration
   - Checks if the user exists and is allowed in the database
   - Sends a custom-styled email with a magic link for authentication

4. **Sign-in Callback:**
   - Verifies user existence in the database and checks if they are allowed to sign in
   - Fetches the user's role from the database
   - Always returns true to show the verify card (for security reasons)

5. **Session Callback:**
   - Extends the session with additional user information:
     - Adds the user's ID to the session
     - Fetches and adds the user's isAllowed status and role from the database

6. **Role Implementation:**
   - User type is extended to include a role field ('USER', 'SUPERVISOR', or 'ADMIN')
   - Role is fetched from the database during sign-in and session callbacks
   - No specific logic is currently in place to restrict access based on roles

## Proposed Role-Based Access Control

### User Roles and Permissions

1. **User Role:**
   - Can log in and create forms
   - Can only access and modify their own forms
   - Default role for new users

2. **Supervisor Role:**
   - Can view all forms created by users
   - Can edit and perform any functions allowed by the forms
   - Cannot create new users or modify user roles

3. **Admin Role:**
   - Has all privileges of User and Supervisor roles
   - Can create new users
   - Can assign or change user roles
   - Has access to admin-specific features and settings

### Implementation Strategy

1. **Database Changes:**
   - Ensure the User model in the database includes a 'role' field with possible values: 'USER', 'SUPERVISOR', 'ADMIN'

2. **Auth Configuration Updates:**
   - Modify the auth.ts file to include an authorized callback in the NextAuth configuration
   - This callback will check the user's role against the required roles for specific routes

3. **Middleware Implementation:**
   - Create a middleware function to wrap API routes and pages that require role-based access
   - This middleware will check the user's role from the session and allow/deny access accordingly

4. **Frontend Changes:**
   - Implement conditional rendering based on user roles for UI elements
   - Create separate dashboard views for each role (User, Supervisor, Admin)

5. **API Route Protection:**
   - Implement role checks in API routes to ensure users can only perform actions allowed for their role

6. **Form Access Control:**
   - Modify form retrieval logic to filter forms based on user role:
     - Users see only their own forms
     - Supervisors and Admins can see all forms

7. **User Management:**
   - Create admin-only routes and components for user creation and role management

8. **Logging and Monitoring:**
   - Implement detailed logging for role-based actions to aid in auditing and troubleshooting

By implementing these changes, we'll create a robust role-based access control system that allows for granular permissions based on user roles. This system will be flexible enough to accommodate future role additions or permission adjustments as needed.

Developers working on this system in the future should be aware that the core of the role-based logic is implemented in the authorized callback in auth.ts and the middleware protecting the routes. Any changes to role permissions should be reflected in these areas, as well as in the frontend components that rely on user roles for rendering decisions.
