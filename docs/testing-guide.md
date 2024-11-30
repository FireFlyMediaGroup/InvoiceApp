# Testing Guide for RBAC Implementation

This document outlines the test cases and provides instructions for running tests related to the Role-Based Access Control (RBAC) implementation in our application.

## Test Cases

### 1. RBAC Middleware Tests

Location: `__tests__/security/rbac.test.ts`

Test cases:
- Should allow access for user with correct role
- Should deny access for user with incorrect role
- Should deny access for unauthenticated user
- Should allow access for user with any of the allowed roles
- Should deny access when trying to escalate privileges

### 2. Invoice API Security Tests

Location: `__tests__/security/invoice.test.ts`

Test cases:
- Should deny access to invoice for unauthenticated user
- Should allow access to invoice for authenticated user with correct role
- Should prevent access to non-existent invoice
- Should sanitize user input in invoice ID

### 3. POWRA API Security Tests

Location: `__tests__/security/powra.test.ts`

Test cases:
- GET /api/powra
  - Should deny access for unauthenticated user
  - Should allow access for authenticated user with correct role
  - Should prevent access to non-existent POWRA
- POST /api/powra
  - Should deny access for unauthenticated user
  - Should allow creation of POWRA for authenticated user with correct role
  - Should prevent XSS in POWRA creation
- PUT /api/powra
  - Should deny access for unauthenticated user
  - Should allow update of POWRA for authenticated user with correct role
  - Should prevent update of non-existent POWRA
- DELETE /api/powra
  - Should deny access for unauthenticated user
  - Should allow deletion of POWRA for authenticated user with correct role
  - Should prevent deletion of non-existent POWRA

### 4. User Management API Tests

Location: `__tests__/api/users.test.ts`

Test cases:
- Should create a new user (admin only)
- Should update user role (admin only)
- Should prevent removal of the last admin
- Should delete a user (admin only)

## Running Tests

To run the tests, follow these steps:

1. Ensure you have all dependencies installed:
   ```
   npm install
   ```

2. Run all tests:
   ```
   npm test
   ```

3. To run a specific test file:
   ```
   npm test -- __tests__/path/to/test-file.test.ts
   ```

4. To run tests with coverage:
   ```
   npm test -- --coverage
   ```

## Interpreting Test Results

- Green checkmarks (✓) indicate passed tests
- Red crosses (✗) indicate failed tests
- The console will display detailed information about any failed tests, including the expected and actual results

## Continuous Integration

Our CI pipeline automatically runs these tests on every pull request and push to the main branch. Ensure all tests pass before merging any changes.

## Adding New Tests

When adding new features or modifying existing ones:

1. Create new test files in the appropriate `__tests__` directory
2. Follow the existing test structure and naming conventions
3. Ensure comprehensive coverage of new functionality, including edge cases and potential security vulnerabilities
4. Update this document with any new test cases or categories

## Best Practices

- Keep tests focused and isolated
- Use descriptive test names that clearly indicate what is being tested
- Mock external dependencies to ensure consistent test results
- Regularly review and update tests as the application evolves

Remember to update this document as new tests are added or existing tests are modified.
