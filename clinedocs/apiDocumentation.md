# API Documentation

This document outlines the API endpoints available in the application, including their allowed roles, request/response formats, and specific notes.

## Table of Contents
1. [User Management](#user-management)
2. [Invoice Management](#invoice-management)
3. [Email Services](#email-services)
4. [POWRA (Plan of Work Risk Assessment)](#powra)
5. [FPL (Field Protection and Logistics) Missions](#fpl-missions)

## User Management

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

## Invoice Management

### GET /api/invoice/[invoiceId]
- **Description**: Retrieve an invoice
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Response**: 
  - Success (200): Invoice PDF
  - Error (404): Invoice not found

## Email Services

### POST /api/email/[invoiceId]
- **Description**: Send an email reminder for an invoice
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Response**: 
  - Success (200): Confirmation of email sent
  - Error (404): Invoice not found
  - Error (500): Failed to send email reminder

## POWRA

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

## FPL Missions

### GET /api/fpl-missions
- **Description**: Retrieve FPL Missions
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (optional) - retrieve a specific mission
  - `page`: number (optional, default: 1)
  - `pageSize`: number (optional, default: 10, max: 100)
  - `missionType`: string (optional) - filter by mission type
- **Response**: 
  - Success (200): FPL Mission(s) or paginated list
  - Error (404): FPL Mission not found

### POST /api/fpl-missions
- **Description**: Create a new FPL Mission
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Request Body**: FPL Mission data (including missionType, date, etc.)
- **Response**: 
  - Success (201): Created FPL Mission record
  - Error (400): Invalid input
  - Error (500): Failed to create FPL Mission

### PUT /api/fpl-missions
- **Description**: Update an FPL Mission
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (required)
- **Request Body**: Updated FPL Mission data
- **Response**: 
  - Success (200): Updated FPL Mission record
  - Error (400): Invalid input or missing ID
  - Error (404): FPL Mission not found
  - Error (500): Failed to update FPL Mission

### DELETE /api/fpl-missions
- **Description**: Delete an FPL Mission
- **Allowed Roles**: SUPERVISOR, ADMIN
- **Query Parameters**:
  - `id`: string (required)
- **Response**: 
  - Success (200): Confirmation message
  - Error (400): Missing FPL Mission ID
  - Error (404): FPL Mission not found
  - Error (500): Failed to delete FPL Mission

### POST /api/fpl-missions/tailboard-document
- **Description**: Create or update a Tailboard Document for an FPL Mission
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Request Body**:
  - `fplMissionId`: string (required)
  - `content`: string (required)
- **Response**: 
  - Success (200): Created/Updated Tailboard Document
  - Error (400): Invalid input
  - Error (404): FPL Mission not found
  - Error (500): Failed to create/update Tailboard Document

### POST /api/fpl-missions/risk-matrix
- **Description**: Create or update a Risk Matrix for an FPL Mission
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Request Body**:
  - `fplMissionId`: string (required)
  - `content`: string (required)
- **Response**: 
  - Success (200): Created/Updated Risk Matrix
  - Error (400): Invalid input
  - Error (404): FPL Mission not found
  - Error (500): Failed to create/update Risk Matrix

### POST /api/fpl-missions/mission-planning-script
- **Description**: Create or update a Mission Planning Script for an FPL Mission
- **Allowed Roles**: USER, SUPERVISOR, ADMIN
- **Request Body**:
  - `fplMissionId`: string (required)
  - `content`: string (required)
- **Response**: 
  - Success (200): Created/Updated Mission Planning Script
  - Error (400): Invalid input
  - Error (404): FPL Mission not found
  - Error (500): Failed to create/update Mission Planning Script

## Notes

- All routes are protected by the `rbacMiddleware`, which checks the user's role against the allowed roles for each route.
- The middleware also handles authentication, ensuring that only authenticated users can access these routes.
- Proper error handling and logging are implemented for all routes to aid in debugging and monitoring.
- The FPL Missions API routes are designed to support the creation, retrieval, updating, and deletion of FPL Missions and their associated documents (Tailboard Document, Risk Matrix, and Mission Planning Script).
- Pagination is implemented for list endpoints to manage large datasets efficiently.
