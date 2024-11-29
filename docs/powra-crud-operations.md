# POWRA Form CRUD Operations

This document outlines the CRUD (Create, Read, Update, Delete) operations for the POWRA (Plan of Work Risk Assessment) form in our application.

## Overview

The POWRA form is a crucial component of our risk assessment process. It consists of four main parts:
1. Stop
2. Think
3. Act
4. Review

Each of these parts contains various fields that users need to fill out to complete a risk assessment.

## API Endpoints

The POWRA form operations are handled by the API route located at `app/api/powra/route.ts`. This file defines the following endpoints:

- POST `/api/powra`: Create a new POWRA form
- GET `/api/powra`: Retrieve all POWRA forms
- GET `/api/powra?id={id}`: Retrieve a specific POWRA form by ID
- PUT `/api/powra`: Update an existing POWRA form
- DELETE `/api/powra?id={id}`: Delete a specific POWRA form by ID

## CRUD Operations

### Create

To create a new POWRA form, send a POST request to `/api/powra` with the form data in the request body. The server will validate the data and create a new entry in the database.

### Read

There are two read operations:
1. To retrieve all POWRA forms, send a GET request to `/api/powra`.
2. To retrieve a specific POWRA form, send a GET request to `/api/powra?id={id}`, where `{id}` is the ID of the form you want to retrieve.

### Update

To update an existing POWRA form, send a PUT request to `/api/powra` with the updated form data in the request body. The server will validate the data and update the corresponding entry in the database.

### Delete

To delete a POWRA form, send a DELETE request to `/api/powra?id={id}`, where `{id}` is the ID of the form you want to delete.

## Testing

The CRUD operations for the POWRA form can be tested using the `test-powra-api.ts` file. This file contains a series of tests that verify the functionality of each CRUD operation.

To run the tests:

1. Ensure that your development environment is set up correctly.
2. Open a terminal and navigate to the project root directory.
3. Run the command: `npm test test-powra-api.ts` (or the appropriate command for your project setup).

The test file includes tests for:
- Creating a new POWRA form
- Retrieving all POWRA forms
- Retrieving a specific POWRA form by ID
- Updating an existing POWRA form
- Deleting a POWRA form

These tests help ensure that the API endpoints are functioning correctly and handling data as expected.

## Conclusion

This document provides an overview of the CRUD operations for the POWRA form in our application. By following these guidelines and utilizing the provided API endpoints, developers can effectively manage POWRA form data within the system.
