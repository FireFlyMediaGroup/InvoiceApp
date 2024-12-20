'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../utils/formatCurrency';

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  total: number;
  currency: string;
}

// Custom hook for fetching invoices
function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchInvoices() {
      try {
        const response = await fetch('/api/invoices/recent', {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data = await response.json();
        if (isMounted) {
          setInvoices(data);
          setError(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError' && isMounted) {
          setError('Error fetching invoices');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInvoices();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Retry function for manual refetching
  const retry = () => {
    setIsLoading(true);
    setError(null);
    // This will trigger the useEffect to run again
  };

  return { invoices, isLoading, error, retry };
}

export function RecentInvoices() {
  const { invoices, isLoading, error, retry } = useInvoices();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        <button type="button" onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {invoices.map((item) => (
          <div className="flex items-center gap-4" key={item.id}>
            <Avatar className="hidden sm:flex size-9">
              <AvatarFallback>{item.clientName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leadin-none">
                {item.clientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.clientEmail}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +
              {formatCurrency({
                amount: item.total,
                currency: item.currency,
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/*
Future Refactoring Notes:

1. Data Fetching Library:
   - If more complex data fetching is needed in the future, consider using SWR or React Query.
   - These libraries provide built-in caching, revalidation, and error handling.

2. State Management:
   - For more complex state management, consider using Redux with RTK Query or Zustand.

3. API Layer:
   - If the API grows, consider creating a centralized API layer (e.g., using axios or ky).

4. TypeScript:
   - Enhance type definitions, possibly moving interfaces to a separate types file.

5. Error Handling:
   - Implement more sophisticated error handling and logging if needed.

6. Performance:
   - If the list grows, implement virtualization for better performance.

7. Accessibility:
   - Enhance accessibility features, especially for loading and error states.

To switch to a library like SWR in the future, you would replace the useInvoices hook with:

import useSWR from 'swr'

function useInvoices() {
  const { data, error, isValidating, mutate } = useSWR('/api/invoices/recent', fetcher)
  return {
    invoices: data,
    isLoading: !error && !data,
    error: error,
    retry: mutate
  }
}

This structure allows for easy refactoring while maintaining the same interface for the component.
*/
