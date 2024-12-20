# Database Schema Documentation

This document outlines the database schema for our application, including all models, their fields, relationships, and relevant enums or constraints.

## User Model

### Fields:
- `id`: String (Primary Key, default: cuid())
- `firstName`: String (Optional)
- `lastName`: String (Optional)
- `address`: String (Optional)
- `email`: String (Unique)
- `emailVerified`: DateTime (Optional)
- `image`: String (Optional)
- `isAllowed`: Boolean (default: false)
- `role`: Role (Enum, default: USER)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (updated automatically)

### Relationships:
- Has many FPLMissions

## Role Enum

```prisma
enum Role {
  USER
  SUPERVISOR
  ADMIN
}
```

## FPLMission Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `status`: String (default: "DRAFT")
- `missionType`: String
- `date`: DateTime
- `userId`: String (Foreign Key to User)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (updated automatically)

### Relationships:
- Belongs to one User
- Has one TailboardDocument
- Has one RiskMatrix
- Has one MissionPlanningScript

## TailboardDocument Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `content`: String
- `fplMissionId`: String (Foreign Key to FPLMission, Unique)

### Relationships:
- Belongs to one FPLMission

## RiskMatrix Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `content`: String
- `fplMissionId`: String (Foreign Key to FPLMission, Unique)

### Relationships:
- Belongs to one FPLMission

## MissionPlanningScript Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `content`: String
- `fplMissionId`: String (Foreign Key to FPLMission, Unique)

### Relationships:
- Belongs to one FPLMission

## POWRA (Plan of Work Risk Assessment) Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `content`: String (or JSON, depending on the structure of POWRA data)
- `userId`: String (Foreign Key to User)
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (updated automatically)

### Relationships:
- Belongs to one User

## Invoice Model

### Fields:
- `id`: String (Primary Key, default: uuid())
- `userId`: String (Foreign Key to User)
- `amount`: Decimal
- `status`: String (e.g., "PAID", "UNPAID", "OVERDUE")
- `dueDate`: DateTime
- `createdAt`: DateTime (default: now())
- `updatedAt`: DateTime (updated automatically)

### Relationships:
- Belongs to one User

## Usage Notes

1. When creating or updating users, assign the appropriate role. The default role is USER if not specified.

   Example:
   ```typescript
   const newUser = await prisma.user.create({
     data: {
       email: 'newuser@example.com',
       firstName: 'New',
       lastName: 'User',
       isAllowed: true,
       role: 'USER' // Can be 'USER', 'SUPERVISOR', or 'ADMIN'
     }
   });
   ```

2. FPL Missions are associated with a user and have one-to-one relationships with TailboardDocument, RiskMatrix, and MissionPlanningScript.

3. The POWRA model structure may need to be adjusted based on the specific requirements of Plan of Work Risk Assessments.

4. The Invoice model is included based on the presence of invoice-related API routes. The exact structure may need to be verified and adjusted according to the actual implementation.

5. Remember to use the role information in your application logic to enforce proper access control.

6. All models include `createdAt` and `updatedAt` fields for tracking record creation and modification times.

7. Foreign key relationships are established using the `@relation` attribute in Prisma schema. Ensure these are properly set up in the actual Prisma schema file.

This schema documentation provides an overview of the database structure. Always refer to the actual Prisma schema file (`prisma/schema.prisma`) for the most up-to-date and detailed schema information.
