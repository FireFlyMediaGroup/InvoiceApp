# Using the POWRA API Test File

This document provides instructions on how to use the test file `test-powra-api.ts` for testing the CRUD operations of the POWRA (Plan of Work Risk Assessment) form API.

## Overview

The `test-powra-api.ts` file contains a series of tests that verify the functionality of the POWRA form API endpoints. These tests cover all CRUD operations: Create, Read, Update, and Delete.

## Prerequisites

Before running the tests, ensure that:

1. Your development environment is set up correctly.
2. The necessary dependencies are installed.
3. The database is properly configured and accessible.

## Running the Tests

To run the tests:

1. Open a terminal window.
2. Navigate to the project root directory.
3. Run the following command:

   ```
   npm test test-powra-api.ts
   ```

   Note: If you're using a different test runner or have a custom script set up, adjust the command accordingly.

## Test Structure

The test file is structured as follows:

1. **Setup**: Initializes the test environment, including any necessary database connections or mock data.

2. **Individual Tests**: Each CRUD operation has its own test case:
   - Creating a new POWRA form
   - Retrieving all POWRA forms
   - Retrieving a specific POWRA form by ID
   - Updating an existing POWRA form
   - Deleting a POWRA form

3. **Teardown**: Cleans up any resources or data created during the tests.

## Test Cases

### Create Test
- Sends a POST request to `/api/powra` with sample POWRA form data.
- Verifies that the response indicates successful creation and returns the created form data.

### Read All Test
- Sends a GET request to `/api/powra`.
- Verifies that the response contains an array of POWRA forms.

### Read Single Test
- Sends a GET request to `/api/powra?id={id}` with a specific ID.
- Verifies that the response contains the correct POWRA form data for that ID.

### Update Test
- Sends a PUT request to `/api/powra` with updated POWRA form data.
- Verifies that the response indicates successful update and returns the updated form data.

### Delete Test
- Sends a DELETE request to `/api/powra?id={id}` with a specific ID.
- Verifies that the response indicates successful deletion.

## Interpreting Results

After running the tests, you'll see output in your terminal indicating whether each test passed or failed. Look for messages like:

- `✓ Create POWRA form`
- `✓ Get all POWRA forms`
- `✓ Get single POWRA form`
- `✓ Update POWRA form`
- `✓ Delete POWRA form`

If a test fails, you'll see detailed error messages helping you identify what went wrong.

## Troubleshooting

If tests fail, consider the following:

1. Check that your local server is running.
2. Verify that your database is properly set up and accessible.
3. Ensure that the API endpoints in `app/api/powra/route.ts` are correctly implemented.
4. Check for any recent changes in the POWRA form structure or API that might affect the tests.

## Extending the Tests

To add new tests or modify existing ones:

1. Open `test-powra-api.ts`.
2. Add new test cases using the testing framework's syntax (e.g., `test('Your test description', async () => { ... })`).
3. Implement the necessary assertions to verify the expected behavior.

Remember to run the tests after any changes to ensure everything still works as expected.

## Conclusion

Regular use of these tests will help ensure the reliability and correctness of the POWRA form API as you develop and maintain your application. If you encounter any issues or need to update the tests, refer back to this document and the `test-powra-api.ts` file.
