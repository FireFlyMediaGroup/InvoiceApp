# FPL Mission Planning Feature Implementation Guide

## Overview

The FPL Mission Planning feature is an extension to the dashboard that allows multiple technicians (users) to manage their missions at various sites. Each mission involves:

1. Risk Calculation Matrix (completed once, before work starts)
2. Mission Planning Script (completed once, before work starts)
3. Tailboard Documents (completed daily per tech on the site, after the mission is approved and work has started)

## Workflow and Status Transitions

### Before project start:
- User (tech) creates an FPL Mission for their site. Initially `DRAFT`.
- User completes Risk Calculation Matrix and Mission Planning Script, both start as `DRAFT`.
- Once both are completed, user submits them, changing each to `PENDING`.
- User can then submit the FPL Mission (if both risk & script are `PENDING`), changing the mission to `PENDING`.
- Supervisor/Admin reviews the mission and approves it. The mission (and its risk/script) moves to `APPROVED`.

### After project start (mission approved):
- Each tech at the site must submit a Tailboard Document daily.
- Tailboard doc starts `DRAFT`, user completes & submits -> `PENDING`.
- Supervisor/Admin approves daily tailboard -> `APPROVED`.

## RBAC Rules
- **USER**: Can fully CRUD their own mission and documents while in `DRAFT`. They can `submit` (DRAFT->PENDING) but cannot approve or revert after approval. They cannot edit `APPROVED` docs or missions.
- **SUPERVISOR/ADMIN**: Can view and manage all users' missions and documents. Can approve `PENDING` items (PENDING->APPROVED). Can modify `APPROVED` if needed.

## Implementation Checklist

### Completed:

1. Database Schema (prisma/schema.prisma):
   - [x] FPLMission model
   - [x] RiskMatrix model
   - [x] MissionPlanningScript model
   - [x] TailboardDocument model

2. API Routes (app/api/fpl-missions/route.ts):
   - [x] GET: Fetch FPL missions
   - [x] POST: Create new FPL mission
   - [x] PUT: Update FPL mission
   - [x] DELETE: Delete FPL mission
   - [x] PATCH: Approve PENDING missions
   - [x] RBAC middleware applied

3. Frontend Components:
   - [x] FPLMissionsList (app/components/FPLMissions/List/FPLMissionsList.tsx)
   - [x] StatusBadge (app/components/FPLMissions/Status/StatusBadge.tsx)
   - [x] RiskMatrixForm (app/components/FPLMissions/Forms/RiskMatrixForm.tsx)
   - [x] MissionPlanningScriptForm (app/components/FPLMissions/Forms/MissionPlanningScriptForm.tsx)
   - [x] TailboardDocumentForm (app/components/FPLMissions/Forms/TailboardDocumentForm.tsx)

4. Actions (app/actions/fplMissions.ts):
   - [x] getFPLMissions
   - [x] createFPLMission
   - [x] updateFPLMission
   - [x] deleteFPLMission
   - [x] approveFPLMission

5. Types (app/utils/types.ts):
   - [x] FPLMissionStatus
   - [x] FPLMission interface

6. Routing:
   - [x] FPL Missions page (app/dashboard/fpl-missions/page.tsx)
   - [x] Individual FPL Mission page (app/dashboard/fpl-missions/[id]/page.tsx)
   - [x] Risk Matrix page (app/dashboard/fpl-missions/risk-matrix/page.tsx)
   - [x] Mission Planning Script page (app/dashboard/fpl-missions/mission-planning/page.tsx)
   - [x] Tailboard Document page (app/dashboard/fpl-missions/tailboard/page.tsx)

7. Dashboard Integration:
   - [x] Added FPL Missions link to DashboardLinks component
   - [x] Implemented dropdown selector for Tailboard, Risk Calculation Matrix, and Mission Planning Script

8. API Routes:
   - [x] Implemented specific routes for risk matrix (app/api/fpl-missions/risk-matrix/route.ts)
   - [x] Implemented specific routes for mission planning script (app/api/fpl-missions/mission-planning-script/route.ts)
   - [x] Implemented specific routes for tailboard document (app/api/fpl-missions/tailboard-document/route.ts)

9. Error Handling:
   - [x] Implemented error handling and success messages for Risk Matrix and Mission Planning Script pages

10. Testing:
    - [x] Written unit tests for RiskMatrixForm component
    - [x] Written unit tests for MissionPlanningScriptForm component
    - [x] Written unit tests for risk matrix API route
    - [x] Written unit tests for mission planning script API route

### To Be Implemented:

1. Frontend Components:
   - [ ] Add edit functionality to FPLMissionsList

2. RBAC:
   - [ ] Ensure proper role checks are implemented in all components and routes
   - [ ] Implement role-based visibility for certain actions (e.g., approval)

3. Error Handling:
   - [ ] Add error boundaries to React components

4. Testing:
   - [ ] Implement integration tests for the entire FPL Mission workflow

5. Documentation:
   - [ ] Create user guide for FPL Mission Planning feature
   - [ ] Update API documentation to include new FPL Mission endpoints

6. Performance Optimization:
   - [ ] Implement pagination or infinite scrolling for FPLMissionsList

7. Security:
   - [ ] Ensure all user inputs are properly sanitized
   - [ ] Implement rate limiting on API routes
   - [ ] Add CSRF protection

## Key Components

1. Database Models (Prisma):
   - `FPLMission` (links to a user and a site, and holds status)
   - `RiskMatrix` (one per mission)
   - `MissionPlanningScript` (one per mission)
   - `TailboardDocument` (multiple per mission, per day, per user)

2. API Routes:
   - `app/api/fpl-missions/` for main mission CRUD and status updates.
   - `app/api/fpl-missions/risk-matrix/` for RiskMatrix operations.
   - `app/api/fpl-missions/mission-planning-script/` for MissionPlanningScript operations.
   - `app/api/fpl-missions/tailboard-document/` for TailboardDocument daily submissions.

3. Frontend Components:
   - Dashboard Listing (like POWRA) at `app/dashboard/fpl-missions/`:
     - Shows all missions and their documents for a user (just theirs) or supervisor/admin (all).
     - Displays status, allows submissions, shows who can approve.
   - Form Pages for Risk Matrix, Mission Script, Tailboard:
     - Implemented with fields and a "Submit" (DRAFT->PENDING) button.

4. RBAC Middleware:
   - Reuse existing `rbacMiddleware` from `app/middleware/rbac.ts`.
   - Ensure allowed roles match required actions (e.g., only admin/supervisor can approve PENDING items).

## Next Steps:

1. Implement proper RBAC checks in all components and routes.
2. Add error boundaries to React components.
3. Implement integration tests for the entire FPL Mission workflow.
4. Create user guide and update API documentation.
5. Implement performance optimizations (pagination/infinite scrolling).
6. Enhance security measures (input sanitization, rate limiting, CSRF protection).

## Testing Strategy

1. Unit Tests:
   - Test Prisma queries, role checks in isolation.
   - Test form validation with Zod.
   - Continue writing unit tests for remaining components and API routes.

2. Integration Tests:
   - API endpoints: Ensure users can only submit their own docs, can't approve, etc.
   - Test mission submission logic, tailboard daily submissions, and approvals.

3. E2E Tests:
   - Simulate user completing risk/script, submitting mission.
   - Supervisor approving mission.
   - User creating daily tailboard doc, submitting, supervisor approving.

Run tests via `npm test` and ensure coverage.

## Documentation & Maintenance

- Update `docs/fpl-missions-user-guide.md`:
  - Outline the workflow:
    - Before project: complete risk/script, submit mission, admin approves.
    - After approval: daily tailboards, submit daily, admin approves.
  - Show screenshots or step-by-step instructions if available.

- Update `CHANGELOG.md` to note new feature.

Maintenance:
- Keep each route and component modular.
- Use clear naming conventions (`FPLMissionsList`, `FPLMissionForm`, etc.).
- Separate logic into hooks where possible (`useFPLMissions` hook for data fetching).

Logging & Monitoring:
- Add logs in `app/utils/monitoring.ts` for mission submissions and approvals.
- Monitor performance and adjust queries as needed.

## Conclusion

This implementation guide outlines a modular approach:
- A clear DB schema with status fields.
- Distinct API routes for each document type.
- A dashboard UI that reflects POWRA's style but adds mission logic.
- A well-defined user workflow and RBAC enforcement.

By following the steps and best practices above, developers can confidently implement and maintain the FPL Mission Planning feature. The checklist provides a clear roadmap of what has been completed and what still needs to be done, ensuring a systematic approach to the implementation.
