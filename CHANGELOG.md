# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Role-Based Access Control (RBAC) implementation
  - New RBAC middleware (app/middleware/rbac.ts)
  - RBAC implementation plan and summary documentation
  - API routes for user management with RBAC
- User management functionality
  - Create User Form (app/components/CreateUserForm.tsx)
  - Modify User Role Form (app/components/ModifyUserRoleForm.tsx)
  - Deactivate User Form (app/components/DeactivateUserForm.tsx)
  - User Management component (app/components/UserManagement.tsx)
  - Admin Dashboard Cards (app/components/AdminDashboardCards.tsx)
- New API routes for user management (app/api/users/route.ts, app/api/users/deactivate/route.ts)
- Improved logging and monitoring (app/utils/monitoring.ts)
- Additional testing for security and API routes (__tests__/security/, __tests__/api/)
- Email verification functionality
- New page for unauthorized access (app/unauthorized/page.tsx)
- New page for email checking (app/check-email/page.tsx)
- Documentation file for authentication process (docs/auth-process.md)
- Database seed script (prisma/seed.ts)
- Database update script (prisma/update-bob.ts)
- Test database connection files (test-db-connection.js and test-db-connection.ts)
- New logo asset (public/SkySpecs_Logo_Stacked_vertical.png)
- New wallpaper asset (public/wallpaper01.png)
- Point of Work Risk Assessment (POWRA) form functionality
  - New POWRA form component (app/components/POWRAForm.tsx)
  - New POWRA page (app/dashboard/powra/page.tsx)
  - Added POWRA link to dashboard navigation
  - New usePOWRAForm hook (app/hooks/usePOWRAForm.ts)
- POWRA API route for handling POWRA operations (app/api/powra/route.ts)

### Changed

- Updated authentication process with RBAC integration
- Improved database schema to support user roles and RBAC
- Modified API routes to incorporate RBAC checks
- Updated dashboard layout and navigation to reflect new user management features
- Enhanced security measures across the application
- Updated authentication process
- Improved database utilities
- Modified Prisma schema
- Updated API routes for authentication and email
- Modified Hero and Navbar components
- Updated login page
- Updated DashboardLinks component to include POWRA link
- Updated import paths in POWRAForm component to use 'components/ui'
- Added "use client" directive to POWRAForm component to resolve server-side rendering issues
- Updated POWRAForm component to include status field and match API structure
- Modified POWRA API route to handle updated data structure
- Improved error handling and logging in both frontend and backend for POWRA functionality

### Fixed

- Various bug fixes and improvements in the authentication flow
- Added "use client" directive to usePOWRAForm.ts to resolve build error related to useState hook usage
- Corrected import paths in POWRAForm component to resolve module not found errors
- Resolved server-side rendering issues with the POWRAForm component by adding the "use client" directive
- Fixed POWRA creation and update functionality
  - Resolved issues with data structure mismatches between frontend and backend
  - Corrected Prisma Client usage for POWRA model

### Development

- Regenerated Prisma Client to recognize POWRA model correctly
- Added comprehensive test suite for RBAC and user management features
- Updated development documentation to reflect new RBAC and user management processes
