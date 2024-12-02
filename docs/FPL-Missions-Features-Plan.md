# FPL Missions Features Plan

## Table of Contents
1. [Overview](#overview)
2. [Relevant Files and Components](#relevant-files-and-components)
3. [Database Schema](#database-schema)
4. [API Routes](#api-routes)
5. [Frontend Components](#frontend-components)
6. [RBAC Implementation](#rbac-implementation)
7. [Implementation Plan](#implementation-plan)
8. [Testing Strategy](#testing-strategy)
9. [Documentation Updates](#documentation-updates)

## Overview

The FPL Missions feature is a new addition to the dashboard, separate from the existing POWRA system. It will include a dropdown selector with three options: Tailboard Document, Risk Matrix, and Mission Planning Script. This feature will be implemented as a new top-level item in the dashboard navigation.

## Relevant Files and Components

Before starting work on this feature, developers should familiarize themselves with the following files and components:

1. **Database Schema**: `prisma/schema.prisma`
   - Contains the current data models
   - Will need to be updated to include new models for FPL Missions

2. **Dashboard Navigation**: `app/components/DashboardNavbar.tsx`
   - Renders the main navigation for the dashboard
   - Will need to be updated to include the new FPL Missions item and dropdown

3. **RBAC Middleware**: `app/middleware/rbac.ts`
   - Implements role-based access control
   - Will need to be updated to include permissions for FPL Missions

4. **Authentication Utility**: `app/utils/auth.ts`
   - Handles user authentication and session management
   - Important for understanding how user roles are managed

5. **Monitoring Utility**: `app/utils/monitoring.ts`
   - Implements logging and monitoring functions
   - Will need to be updated to include FPL Missions-related events

6. **Dashboard Layout**: `app/dashboard/layout.tsx`
   - Defines the layout for the dashboard pages
   - May need to be updated to accommodate FPL Missions components

7. **API Route Examples**: `app/api/powra/route.ts`, `app/api/invoice/[invoiceId]/route.ts`
   - Serve as references for implementing new API routes for FPL Missions

8. **Form Component Examples**: `app/components/POWRAForm.tsx`, `app/components/CreateUserForm.tsx`
   - Serve as references for implementing new form components for FPL Missions

9. **List Component Example**: `app/components/POWRAList.tsx`
   - Serves as a reference for implementing the FPL Missions list view

## Database Schema

We need to add new models for FPL Missions. Here's a proposed addition to the schema in `prisma/schema.prisma`:

```prisma
model FPLMission {
  id                    String   @id @default(uuid())
  status                String   @default("DRAFT")
  missionType           String
  date                  DateTime
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  tailboardDocument     TailboardDocument?
  riskMatrix            RiskMatrix?
  missionPlanningScript MissionPlanningScript?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model TailboardDocument {
  id           String     @id @default(uuid())
  content      String
  fplMissionId String     @unique
  fplMission   FPLMission @relation(fields: [fplMissionId], references: [id])
}

model RiskMatrix {
  id           String     @id @default(uuid())
  content      String
  fplMissionId String     @unique
  fplMission   FPLMission @relation(fields: [fplMissionId], references: [id])
}

model MissionPlanningScript {
  id           String     @id @default(uuid())
  content      String
  fplMissionId String     @unique
  fplMission   FPLMission @relation(fields: [fplMissionId], references: [id])
}
```

## API Routes

New API routes will need to be created for FPL Missions. These should be implemented in a new file: `app/api/fpl-missions/route.ts`. The structure should include:

- GET: Retrieve FPL Missions (with pagination)
- POST: Create a new FPL Mission
- PUT: Update an existing FPL Mission
- DELETE: Delete an FPL Mission

Additional routes for each sub-component:
- `app/api/fpl-missions/tailboard-document/route.ts`
- `app/api/fpl-missions/risk-matrix/route.ts`
- `app/api/fpl-missions/mission-planning-script/route.ts`

Each route should implement proper RBAC checks using the `rbacMiddleware`.

## Frontend Components

New components to be created:

1. `app/components/FPLMissions/FPLMissionsList.tsx`
   - Displays a list of FPL Missions
   - Implements pagination
   - Allows filtering by mission type

2. `app/components/FPLMissions/FPLMissionForm.tsx`
   - Form for creating and editing FPL Missions
   - Includes fields for all FPL Mission properties
   - Implements form validation using Zod

3. `app/components/FPLMissions/TailboardDocumentForm.tsx`
   - Form for creating and editing Tailboard Documents
   - Implements form validation using Zod

4. `app/components/FPLMissions/RiskMatrixForm.tsx`
   - Form for creating and editing Risk Matrices
   - Implements form validation using Zod

5. `app/components/FPLMissions/MissionPlanningScriptForm.tsx`
   - Form for creating and editing Mission Planning Scripts
   - Implements form validation using Zod

6. `app/components/FPLMissions/FPLMissionsDropdown.tsx`
   - Implements the dropdown selector for FPL Missions sub-components

Update `app/components/DashboardNavbar.tsx` to include the new FPL Missions item and integrate the FPLMissionsDropdown component.

## RBAC Implementation

Update `app/middleware/rbac.ts` to include new roles or permissions for FPL Missions. Consider the following permissions:

- VIEW_FPL_MISSIONS
- CREATE_FPL_MISSIONS
- EDIT_FPL_MISSIONS
- DELETE_FPL_MISSIONS

Ensure these permissions are properly assigned to existing roles (USER, SUPERVISOR, ADMIN) based on the project requirements.

## Implementation Plan

1. **Database Schema Update**
   - Update `prisma/schema.prisma` with new models
   - Generate migration: `npx prisma migrate dev --name add_fpl_missions`
   - Update seed data in `prisma/seed.ts` to include sample FPL Missions

2. **API Routes**
   - Create `app/api/fpl-missions/route.ts`
   - Create routes for sub-components (tailboard-document, risk-matrix, mission-planning-script)
   - Implement CRUD operations with RBAC checks
   - Add proper error handling and logging

3. **Frontend Components**
   - Create new components in `app/components/FPLMissions/`
   - Update `app/components/DashboardNavbar.tsx` to include FPL Missions item and dropdown
   - Implement state management using React hooks

4. **Routing**
   - Create new pages in `app/dashboard/fpl-missions/`
   - Implement dynamic routing for individual FPL Mission items and sub-components

5. **RBAC Updates**
   - Update `app/middleware/rbac.ts` with new permissions
   - Modify components to respect new RBAC rules

6. **Forms and Validation**
   - Implement Zod schemas for FPL Missions in a new file: `app/utils/fplMissionSchemas.ts`
   - Create reusable form components

7. **State Management**
   - Implement custom hooks for FPL Missions data fetching and manipulation

8. **UI/UX Enhancements**
   - Design and implement UI for FPL Missions list view
   - Create modals or slide-overs for FPL Missions forms
   - Implement loading states and error handling

9. **Testing**
   - Write unit tests for new components and utilities
   - Create integration tests for FPL Missions
   - Develop end-to-end tests for FPL Missions workflows

10. **Documentation**
    - Update API documentation
    - Create user documentation for the FPL Missions feature
    - Update the RBAC implementation plan

11. **Performance Optimization**
    - Implement pagination for FPL Missions list
    - Optimize database queries

12. **Logging and Monitoring**
    - Update `app/utils/monitoring.ts` to include FPL Missions-related events

13. **Security Review**
    - Conduct a security review of the new feature
    - Ensure all user inputs are properly sanitized and validated

14. **Accessibility**
    - Ensure all new components are accessible
    - Test with screen readers and keyboard navigation

15. **Code Review and Refactoring**
    - Conduct thorough code reviews
    - Refactor any duplicate code

16. **User Acceptance Testing**
    - Prepare UAT scenarios
    - Conduct UAT with stakeholders and gather feedback

17. **Deployment Planning**
    - Create a deployment plan
    - Prepare rollback procedures

18. **Final Review and Sign-off**
    - Conduct a final review of all implemented features
    - Obtain sign-off from project stakeholders

## Testing Strategy

1. **Unit Tests**
   - Test all new utility functions and hooks
   - Test individual components in isolation
   - Use Jest and React Testing Library

2. **Integration Tests**
   - Test API routes: `__tests__/api/fpl-missions.test.ts`
   - Test RBAC functionality for FPL Missions: `__tests__/security/fpl-missions.test.ts`

3. **End-to-End Tests**
   - Create E2E tests using Cypress or Playwright
   - Cover main user flows for FPL Missions and its sub-components

## Documentation Updates

1. Create `docs/api-routes-fpl-missions.md` to document new FPL Missions routes
2. Create `docs/fpl-missions-user-guide.md` for end-user documentation
3. Update `docs/rbac-implementation-plan-v2.md` to include FPL Missions permissions
4. Update `CHANGELOG.md` with details of the new feature

By following this plan and referring to the existing implementation of other features, developers should have a clear understanding of how to implement the FPL Missions feature as a separate item on the dashboard with its own dropdown selector, while maintaining consistency with the current project structure and best practices.
