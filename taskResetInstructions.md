# Development Context Summary

## Task Overview & Current Status

### Core Problem/Feature:
The project appears to be an invoice management and workflow application with additional features for FPL (Flight Plan) missions, POWRA (Pre-Operation Work Risk Assessment), and user management.

### Current Implementation Status:
- The application is built using Next.js 15.0.3 with React 19.0.0-rc.
- It uses Prisma as an ORM with a PostgreSQL database.
- Authentication is implemented using NextAuth with magic link functionality.
- The project includes features for invoice management, POWRA, and FPL missions.

### Key Architectural Decisions:
1. Next.js for server-side rendering and API routes
2. Prisma for database ORM
3. Role-Based Access Control (RBAC) for user permissions
4. Magic link authentication for user login

### Critical Constraints/Requirements:
- Role-based access control (USER, SUPERVISOR, ADMIN)
- Secure user management process
- Integration with external services (e.g., Mailtrap for email)

## Codebase Navigation

### Most Relevant Files:
1. `prisma/schema.prisma`: Defines the database schema and relationships
2. `app/layout.tsx`: Root layout component for the Next.js application
3. `docs/user-management-process.md`: Documentation for user management workflow
4. `package.json`: Project dependencies and scripts

### Key File Roles:
- `prisma/schema.prisma`: 
  - Defines models for User, Invoice, POWRA, FPLMission, and related entities
  - Establishes relationships between models
- `app/layout.tsx`: 
  - Sets up the root layout for the application
  - Implements SessionProviderWrapper for authentication
- `docs/user-management-process.md`:
  - Outlines the user creation, authentication, and role modification processes
  - Describes RBAC implementation and security considerations

### Important Dependencies:
- Next.js
- Prisma
- NextAuth
- React Hook Form
- Zod (for schema validation)
- Tailwind CSS (for styling)

## Technical Context

### Non-obvious Technical Assumptions:
- The application uses magic links for authentication instead of traditional password-based login
- RBAC is implemented using middleware to check user roles before allowing access to protected routes

### External Services/APIs:
- Mailtrap (for email sending)
- PostgreSQL (as the database)

### Performance Considerations:
- Server-side rendering with Next.js for improved initial load times
- Use of Prisma for efficient database queries

### Security Considerations:
- Magic links are single-use and expire after a set period
- User management functions are restricted to admin users only
- All user management actions are logged for auditing purposes

## Development Progress

### Last Completed Milestone/Task:
- Implementation of basic user management process with RBAC

### Immediate Next Steps:
1. Implement user listing and search functionality for admins
2. Add ability to disable user accounts
3. Enhance FPL mission and POWRA features
4. Implement multi-factor authentication for enhanced security

### Known Issues/Technical Debt:
- Lack of comprehensive test coverage
- Need for more detailed documentation on FPL mission and POWRA workflows

## Developer Notes

### Codebase Structure Insights:
- The project follows Next.js 13+ app directory structure
- API routes are located in the `app/api` directory
- Components are organized in the `app/components` directory

### Workarounds/Temporary Solutions:
- None explicitly mentioned in the examined files

### Areas Needing Attention:
1. Enhancing test coverage, especially for critical user management and RBAC functions
2. Improving documentation for FPL mission and POWRA features
3. Implementing more robust error handling and logging throughout the application
4. Optimizing database queries and implementing caching where appropriate
5. Ensuring scalability of the authentication system, especially with the use of magic links

This development context summary provides an overview of the current state of the project, key architectural decisions, and areas for future development. It should serve as a starting point for developers to understand the project structure and continue development without needing to rediscover key context.
