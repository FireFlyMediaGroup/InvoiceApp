'use client';

import { Suspense } from 'react';
import { InvoiceGraph } from './InvoiceGraph';
import { Skeleton } from '../../components/ui/skeleton';

export function InvoiceGraphWrapper() {
  return (
    <Suspense fallback={<Skeleton className="w-full h-64" />}>
      <InvoiceGraph />
    </Suspense>
  );
}
