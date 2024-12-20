import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  if (error instanceof Error) {
    console.error(`[ERROR] ${message}:`, error.message, error.stack);
  } else {
    console.error(`[ERROR] ${message}:`, error);
  }
}

export function monitorRoleBasedAccess(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const start = Date.now();
    try {
      const response = await handler(request);
      const duration = Date.now() - start;

      const userInfo = JSON.parse(request.headers.get('X-User-Info') || '{}');
      const { method, url } = request;

      console.log(`[ACCESS] ${method} ${url} - User: ${userInfo.user?.id}, Role: ${userInfo.user?.role}, Duration: ${duration}ms`);

      if (response.status === 403) {
        await logSuspiciousActivity({
          userId: userInfo.user?.id,
          action: 'Unauthorized Access Attempt',
          details: `${method} ${url}`,
          severity: 'medium',
        });
      }

      if (duration > 5000) {
        await logSuspiciousActivity({
          userId: userInfo.user?.id,
          action: 'Slow Request',
          details: `${method} ${url} - Duration: ${duration}ms`,
          severity: 'low',
        });
      }

      return response;
    } catch (error) {
      logError(`Error in request handler: ${request.method} ${request.url}`, error);
      return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

export function setupMonitoring() {
  console.log('Monitoring setup completed');
}
