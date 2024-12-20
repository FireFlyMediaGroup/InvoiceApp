'use client';

import { useSession } from 'next-auth/react';
import FPLMissionsDashboard from '../../components/FPLMissionsDashboard';

export default function FPLMissionsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Access Denied. Please log in.</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <FPLMissionsDashboard />
    </div>
  );
}
