'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { AdminTailboardList } from '../../../../components/FPLMissions/List/AdminTailboardList';
import { Skeleton } from '@/components/ui/skeleton';

export default function TailboardListPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="w-full h-64" />;
  }

  if (status === 'unauthenticated') {
    return <div>Access Denied. Please log in to view this page.</div>;
  }

  const allowedRoles = ['ADMIN', 'SUPERVISOR', 'USER'];
  const userRole = session?.user?.role as string | undefined;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <div>Error: You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tailboard Documents</h1>
      <AdminTailboardList />
    </div>
  );
}
