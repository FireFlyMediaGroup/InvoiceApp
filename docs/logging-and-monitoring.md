# Logging and Monitoring Setup

This document outlines the logging and monitoring setup for our application, focusing on role-based access control (RBAC) activities.

## Logging

### Role-Based Actions

All role-based actions are logged using the `logSuspiciousActivity` function in `app/utils/monitoring.ts`. This function logs the following information:

- User ID
- Action performed
- Details of the action
- Severity level (low, medium, high)

Example log entry:
```
[SUSPICIOUS ACTIVITY] {"userId":"123","action":"Unauthorized Access Attempt","details":"GET /api/admin/users","severity":"medium"}
```

### Access Attempts

All role-based access attempts are logged using the `monitorRoleBasedAccess` function in `app/utils/monitoring.ts`. This function logs the following information:

- HTTP method
- URL accessed
- User ID
- User role
- Request duration

Example log entry:
```
[ACCESS] GET /api/admin/users - User: 123, Role: USER, Duration: 150ms
```

## Monitoring

### Failed Access Attempts

Failed access attempts due to insufficient roles are monitored and logged. These are identified by HTTP 403 (Forbidden) responses in the `monitorRoleBasedAccess` function.

### Slow Requests

Requests that take longer than 5 seconds to process are flagged as suspicious and logged.

## Accessing Logs

Currently, logs are output to the console. In a production environment, these logs should be sent to a centralized logging system (e.g., ELK stack, Splunk, or CloudWatch).

To access logs:
1. Check the application console output
2. (Future implementation) Access the centralized logging system dashboard

## Interpreting Logs

- [SUSPICIOUS ACTIVITY] logs indicate potential security issues and should be investigated promptly.
- [ACCESS] logs provide an audit trail of all role-based access attempts.
- Pay special attention to:
  - Multiple failed access attempts from the same user
  - Unusual patterns of access attempts
  - Frequent slow requests, which may indicate performance issues or potential DoS attempts

## Alerts

Currently, alerts are logged to the console. In a production environment, these should be integrated with an alerting system (e.g., PagerDuty, OpsGenie) to notify administrators of suspicious activities in real-time.

## Future Improvements

1. Integrate with a centralized logging system
2. Implement real-time alerting for suspicious activities
3. Create dashboards for visualizing role-based access patterns
4. Implement log rotation and retention policies
5. Add more granular logging for specific sensitive operations

## Maintenance

Regularly review and analyze logs to:
1. Identify potential security threats
2. Optimize system performance
3. Ensure RBAC is functioning as expected
4. Identify areas for improvement in the RBAC implementation

Remember to update this document as the logging and monitoring setup evolves.
