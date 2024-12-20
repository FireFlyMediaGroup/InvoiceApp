'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MissionPlanningScriptForm } from '@/app/components/FPLMissions/Forms/MissionPlanningScriptForm';
import type { MissionPlanningScriptFormValues } from '@/app/components/FPLMissions/Forms/MissionPlanningScriptForm';
import { toast } from 'react-hot-toast';

export default function MissionPlanningScriptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [fplMissionId, setFplMissionId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams) {
      setFplMissionId(searchParams.get('fplMissionId'));
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const allowedRoles = ['ADMIN', 'SUPERVISOR', 'USER'];
  const userRole = session?.user?.role as string | undefined;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <div>Error: You do not have permission to access this page.</div>;
  }

  if (!fplMissionId) {
    return <div>Error: Missing FPL Mission ID</div>;
  }

  const handleSubmit = async (data: MissionPlanningScriptFormValues) => {
    try {
      const response = await fetch('/api/fpl-missions/mission-planning-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fplMissionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit mission planning script');
      }

      toast.success('Mission planning script submitted successfully');
      router.push(`/dashboard/fpl-missions/${fplMissionId}`);
    } catch (error) {
      console.error('Error submitting mission planning script:', error);
      toast.error('Failed to submit mission planning script. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Mission Planning Script</h1>
      <MissionPlanningScriptForm onSubmit={handleSubmit} />
    </div>
  );
}
