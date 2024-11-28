# Authentication Process Documentation

This document outlines the authentication process for the InvoiceApp, detailing how the functions flow and interact to authenticate users.

## Overview

The authentication system uses NextAuth.js with a custom Nodemailer provider for magic link authentication. It includes an additional layer of authorization that only allows specific users (marked as allowed in the database) to access the application. The application uses Supabase as the database backend, managed through Prisma ORM.

## Components

1. **Prisma Schema** (`prisma/schema.prisma`)
2. **NextAuth Configuration** (`app/utils/auth.ts`)
3. **Login Page** (`app/login/page.tsx`)
4. **Unauthorized Page** (`app/unauthorized/page.tsx`)

## Authentication Flow

1. **User Attempts Login**

   - The user enters their email on the login page (`app/login/page.tsx`).
   - The form submits the email to the NextAuth signIn function.

2. **NextAuth SignIn Process**

   - The signIn function in `app/utils/auth.ts` is triggered.
   - It checks if the user exists in the database and if they are allowed to access the application.

3. **Database Check**

   - The Prisma client queries the Supabase database to find the user by email.
   - It checks the `isAllowed` field of the user record.

4. **Authorization Decision**

   - If the user is found and `isAllowed` is true, the authentication proceeds.
   - If the user is not found or `isAllowed` is false, the user is redirected to the unauthorized page.

5. **Magic Link Sent**

   - If authorized, NextAuth sends a magic link to the user's email using Nodemailer.

6. **User Clicks Magic Link**

   - The user receives the email and clicks the magic link.
   - NextAuth verifies the link and creates a session for the user.

7. **Redirect to Dashboard**
   - Upon successful authentication, the user is redirected to the dashboard.

## Key Functions and Their Roles

### `signIn` (NextAuth callback in `app/utils/auth.ts`)

```typescript
async signIn({ user }) {
  if (!user.email) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return dbUser?.isAllowed ?? false;
}
```

This function is called during the sign-in process. It checks if the user exists in the Supabase database and if they are allowed to access the application.

### `auth` (NextAuth function in `app/utils/auth.ts`)

This is the main NextAuth configuration function. It sets up the authentication providers, callbacks, and pages for the authentication process.

### Login Form Submit Action (`app/login/page.tsx`)

```typescript
action={async (formData) => {
  "use server";
  await signIn("nodemailer", formData);
}}
```

This server action is triggered when the login form is submitted. It calls the NextAuth signIn function with the "nodemailer" provider.

## Database Schema

The User model in the Prisma schema includes an `isAllowed` field:

```prisma
model User {
  // ... other fields
  isAllowed Boolean @default(false)
  // ... other fields
}
```

This field determines whether a user is authorized to access the application.

## Supabase and Prisma Integration

The application uses Supabase as the database backend, with Prisma as the ORM layer. This setup allows for type-safe database queries and migrations while leveraging Supabase's powerful features.

To reflect changes in the Prisma schema to the Supabase database:

1. Make changes to the Prisma schema (`prisma/schema.prisma`).
2. Run `npx prisma generate` to update the Prisma client.
3. Run `npx prisma db push` to push the changes to your Supabase database.

## Modifying the Authentication Process

To modify the authentication process:

1. **Changing Authorization Criteria**: Update the `signIn` callback in `app/utils/auth.ts`.
2. **Modifying Email Provider**: Adjust the Nodemailer configuration in the NextAuth setup.
3. **Changing Redirect Behavior**: Update the `pages` configuration in the NextAuth setup.
4. **Adding New Fields**: Modify the Prisma schema, generate a new client, and update the relevant parts of the auth process. Then push the changes to Supabase.

Remember to run `npx prisma generate` after any changes to the Prisma schema to update the Prisma client, and `npx prisma db push` to update the Supabase database.

## Managing User Access

To manage which users are allowed to access the application:

1. Use the Supabase dashboard to directly edit user records, setting the `isAllowed` field as needed.
2. Alternatively, create an admin interface in your application that updates the `isAllowed` field using Prisma queries.

## Security Considerations

- Ensure that the `isAllowed` field is properly set for each user in the Supabase database.
- Regularly review and update the list of allowed users.
- Monitor failed login attempts for potential security issues.
- Keep the NextAuth, Prisma, and other dependencies up to date for the latest security patches.
- Utilize Supabase's built-in security features, such as Row Level Security, for additional data protection.

By understanding this authentication flow, developers can effectively maintain and modify the authentication process as needed while leveraging the benefits of both Supabase and Prisma.
