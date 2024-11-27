# POWRA (Point of Work Risk Assessment) Feature Documentation

## Overview

The POWRA (Point of Work Risk Assessment) feature is a new addition to our application that allows users to create, view, edit, and manage risk assessments for various work tasks. This feature is designed to enhance workplace safety by providing a structured approach to identifying and mitigating potential risks before starting a task.

## Components

### 1. Database Model

The POWRA feature is built on a new database model defined in the Prisma schema:

```prisma
model POWRA {
  id          String      @id @default(uuid())
  status      POWRAStatus @default(DRAFT)
  headerFields Json
  beforeStartChecklist Json
  controlMeasures Json
  reviewComments String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  User      User     @relation(fields: [userId], references: [id])
  userId    String
}

enum POWRAStatus {
  DRAFT
  SUBMITTED
  APPROVED
}
```

This model includes:
- A unique identifier
- The current status of the POWRA (draft, submitted, or approved)
- Header fields for general information
- A before-start checklist
- Control measures for identified risks
- Review comments
- Creation and update timestamps
- A relation to the User model

### 2. API Routes

The POWRA feature includes a set of API routes for CRUD (Create, Read, Update, Delete) operations. These are defined in `app/api/powra/route.ts`:

- GET: Fetches either a single POWRA by ID or all POWRAs for the authenticated user
- POST: Creates a new POWRA
- PUT: Updates an existing POWRA
- DELETE: Deletes a POWRA

All routes include authentication checks to ensure that users can only access and modify their own POWRAs.

### 3. Frontend Components

#### POWRAList Component

Located in `app/components/POWRAList.tsx`, this component displays a list of existing POWRAs for the user. It includes functionality to:
- Fetch and display POWRAs
- Provide options to edit, delete, or submit POWRAs
- Copy POWRA IDs to the clipboard

#### POWRAForm Component

Located in `app/components/POWRAForm.tsx`, this component is used for both creating new POWRAs and editing existing ones. It includes:
- Form fields for all POWRA data (header fields, checklist, control measures, etc.)
- Dynamic addition of control measures
- Submission handling for both new and existing POWRAs

#### POWRA Page

Located in `app/dashboard/powra/page.tsx`, this is the main page for the POWRA feature. It:
- Toggles between the POWRAList and POWRAForm views
- Handles the creation of new POWRAs and editing of existing ones

## Workflow

1. Users navigate to the POWRA page in the dashboard.
2. They can view their existing POWRAs in a list format.
3. Users can create a new POWRA by clicking the "Create POWRA" button.
4. When creating or editing a POWRA, users fill out:
   - Header information (date, location, task description)
   - A "Before You Start" checklist
   - Control measures for identified risks
   - Review comments
5. Users can save POWRAs as drafts, submit them for approval, or (if authorized) approve them.
6. Existing POWRAs can be edited, deleted, or submitted from the list view.

## Security Considerations

- All POWRA operations are tied to the authenticated user.
- API routes include checks to ensure users can only access and modify their own POWRAs.
- The frontend components respect the user's permissions and POWRA status (e.g., only showing the "Submit" option for draft POWRAs).

## Future Enhancements

Potential areas for future development include:
- Approval workflows for submitted POWRAs
- Reporting and analytics features
- Integration with other safety management systems
- Mobile-friendly interface for on-site POWRA creation and management

## Technical Notes

- The POWRA feature uses Next.js API routes for backend functionality.
- Prisma is used for database operations.
- The frontend is built with React and uses various UI components from a custom component library.
- Authentication is handled through NextAuth.js.

## Troubleshooting

If encountering issues with the POWRA feature:
1. Ensure the Prisma client has been regenerated after any schema changes:
   ```
   npx prisma generate
   ```
2. Check that all necessary environment variables are set correctly.
3. Verify that the user has the correct permissions in the database.
4. Check the server logs for any error messages or unexpected behavior.

For any persistent issues, please contact the development team.
