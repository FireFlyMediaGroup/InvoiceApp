# API Routes and Role-Based Access Control (RBAC)

This document outlines the role-based access control implemented for various API routes in the application.

## User Management Routes

### POST /api/users
- **Description**: Create a new user
- **Allowed Roles**: ADMIN
- **Request Body**:
  - `email`: string (required)
  - `role`: string (required)
  - `firstName`: string (required)
  - `lastName`: string (required)
- **Response**: 
  - Success (201): User object and confirmation message
  - Error (400): Missing required fields
  - Error (500): Failed to create user

### PUT /api/users
- **Description**: Update a user's role
- **Allowed Roles**: ADMIN
- **Request Body**:
  - `id`: string (required)
  - `newRole`: string (required)
- **Response**: 
  - Success (200): Updated user object
  - Error (400): Missing required fields or attempt to remove last admin
  - Error (500): Failed to update user role

### DELETE /api/users
- **Description**: Delete a user
- **Allowed Roles**: ADMIN
- **Query Parameters**:
  - `id`: string (required)
- **Response**: 
  - Success (200): Confirmation message
  - Error (400): Missing user ID or attempt to delete last admin
  - Error (404): User not found
  - Error (500): Failed to delete user

## Invoice Routes

### GET /api/invoice/[invoiceId]
- **Description**: Retrieve an invoice
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Response**: 
  - Success (200): Invoice PDF
  - Error (404): Invoice not found

## Email Routes

### POST /api/email/[invoiceId]
- **Description**: Send an email reminder for an invoice
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Response**: 
  - Success (200): Confirmation of email sent
  - Error (404): Invoice not found
  - Error (500): Failed to send email reminder

## POWRA Routes

### GET /api/powra
- **Description**: Retrieve POWRA records
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (optional) - retrieve a specific POWRA
  - `page`: number (optional, default: 1)
  - `pageSize`: number (optional, default: 10, max: 100)
- **Response**: 
  - Success (200): POWRA record(s) or paginated list
  - Error (404): POWRA not found

### POST /api/powra
- **Description**: Create a new POWRA record
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Request Body**: POWRA data (refer to schema for details)
- **Response**: 
  - Success (201): Created POWRA record
  - Error (400): Invalid input
  - Error (500): Failed to create POWRA

### PUT /api/powra
- **Description**: Update a POWRA record
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (required)
- **Request Body**: Updated POWRA data
- **Response**: 
  - Success (200): Updated POWRA record
  - Error (400): Invalid input or missing ID
  - Error (404): POWRA not found
  - Error (500): Failed to update POWRA

### DELETE /api/powra
- **Description**: Delete a POWRA record
- **Allowed Roles**: SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (required)
- **Response**: 
  - Success (200): Confirmation message
  - Error (400): Missing POWRA ID
  - Error (404): POWRA not found
  - Error (500): Failed to delete POWRA

## Notes

- All routes are protected by the `rbacMiddleware`, which checks the user's role against the allowed roles for each route.
- The middleware also handles authentication, ensuring that only authenticated users can access these routes.
- Proper error handling and logging are implemented for all routes to aid in debugging and monitoring.
