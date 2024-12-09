import type { NextResponse, NextRequest } from 'next/server';

interface AlertDetails {
  userId?: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export async function logSuspiciousActivity(details: AlertDetails) {
  console.log(`[SUSPICIOUS ACTIVITY] ${JSON.stringify(details)}`);
  console.log(`[ALERT] Suspicious activity detected: ${details.action}`);
}

export function logError(message: string, error: unknown) {
  console.error(`[ERROR] ${message}`, error);
}

export function monitorRoleBasedAccess(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const start = Date.now();
    const response = await handler(request);
    const duration = Date.now() - start;

    const user = JSON.parse(request.headers.get('X-User-Info') || '{}');
    const { method, url } = request;

    console.log(`[ACCESS] ${method} ${url} - User: ${user.id}, Role: ${user.role}, Duration: ${duration}ms`);

    if (response.status === 403) {
      await logSuspiciousActivity({
        userId: user.id,
        action: 'Unauthorized Access Attempt',
        details: `${method} ${url}`,
        severity: 'medium',
      });
    }

    if (duration > 5000) {
      await logSuspiciousActivity({
        userId: user.id,
        action: 'Slow Request',
        details: `${method} ${url} - Duration: ${duration}ms`,
        severity: 'low',
      });
    }

    return response;
  };
}

export function setupMonitoring() {
  console.log('Monitoring setup completed');
}
