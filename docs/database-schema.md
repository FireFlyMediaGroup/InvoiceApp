# Database Schema Documentation

## User Model

The User model has been updated to include a role field for Role-Based Access Control (RBAC).

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

### Role Enum:

The Role enum has been added to define the possible roles for users:

```prisma
enum Role {
  USER
  SUPERVISOR
  ADMIN
}
```

## Seed Data

The seed data has been updated to include roles for the initial users:

1. Chris Odom (chris.odom@skyspecs.com):
   - Role: ADMIN
   - isAllowed: true

2. Bob Smith (bob@example.com):
   - Role: USER
   - isAllowed: true

## Usage

When creating or updating users, make sure to assign the appropriate role. The default role is USER if not specified.

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

Remember to use the role information in your application logic to enforce proper access control.
