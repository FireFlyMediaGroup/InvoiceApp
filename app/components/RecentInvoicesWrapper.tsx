"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/ui/skeleton';
import { RecentInvoices } from './RecentInvoices';

export function RecentInvoicesWrapper() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return <RecentInvoices />;
}
