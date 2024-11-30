# User Management Process

This document outlines the user management process in our application, including user creation, role modification, and authentication using magic links.

## User Creation

1. An admin user accesses the User Management page.
2. The admin fills out the "Create New User" form with the following information:
   - Email
   - First Name
   - Last Name
   - Role (USER, SUPERVISOR, or ADMIN)
3. Upon submission, the application:
   - Creates a new user in the database
   - Sets the `isAllowed` flag to true
   - Sends a magic link to the provided email address

## User Authentication

1. When a new user receives the magic link, they click on it to access the application.
2. The magic link verifies the user's email and logs them into the application.
3. On subsequent logins, the user can request a new magic link by entering their email address on the login page.

## Role Modification

1. An admin user accesses the User Management page.
2. The admin fills out the "Modify User Role" form with the following information:
   - User ID
   - New Role (USER, SUPERVISOR, or ADMIN)
3. Upon submission, the application updates the user's role in the database.

## Role-Based Access Control (RBAC)

The application implements RBAC to restrict access to certain features and API endpoints based on user roles:

- USER: Basic access to application features
- SUPERVISOR: Additional access to supervisory functions
- ADMIN: Full access to all features, including user management

RBAC is enforced through middleware that checks the user's role before allowing access to protected routes and API endpoints.

## Security Considerations

- Magic links are single-use and expire after a set period (e.g., 24 hours).
- User management functions (creation and role modification) are restricted to admin users only.
- All user management actions are logged for auditing purposes.

## Future Improvements

- Implement a user listing and search functionality for admins.
- Add the ability to disable user accounts.
- Implement multi-factor authentication for enhanced security.
