import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function useApi() {
  const { data: session, status } = useSession();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    console.log(`[useApi] Fetching ${url}`);
    
    if (status === 'loading') {
      console.log('[useApi] Session is still loading');
      throw new Error('Session is still loading');
    }

    if (status === 'unauthenticated' || !session) {
      console.error('[useApi] No active session');
      throw new Error('No active session');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    console.log(`[useApi] Headers set for ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // This ensures the session cookie is sent with the request
      });

      if (response.status === 429) {
        console.error(`[useApi] Rate limit exceeded for ${url}`);
        throw new RateLimitError('Rate limit exceeded. Please try again later.');
      }

      if (response.status === 401) {
        console.error(`[useApi] Unauthorized access to ${url}`);
        throw new Error('Unauthorized access. Please log in again.');
      }

      if (!response.ok) {
        console.error(`[useApi] HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[useApi] Data received for ${url}`, data);
      return data;
    } catch (error) {
      console.error(`[useApi] Error for ${url}:`, error);
      if (error instanceof RateLimitError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error(`Fetch error: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
    }
  }, [session, status]);

  return { fetchWithAuth };
}
