'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RiskMatrixForm } from '@/app/components/FPLMissions/Forms/RiskMatrixForm';
import type { RiskMatrixFormValues } from '@/app/components/FPLMissions/Forms/RiskMatrixForm';
import { toast } from 'react-hot-toast';

export default function RiskMatrixPage() {
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

  const handleSubmit = async (data: RiskMatrixFormValues) => {
    try {
      const response = await fetch('/api/fpl-missions/risk-matrix', {
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
        throw new Error('Failed to submit risk matrix');
      }

      toast.success('Risk matrix submitted successfully');
      router.push(`/dashboard/fpl-missions/${fplMissionId}`);
    } catch (error) {
      console.error('Error submitting risk matrix:', error);
      toast.error('Failed to submit risk matrix. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Risk Calculation Matrix</h1>
      <RiskMatrixForm onSubmit={handleSubmit} />
    </div>
  );
}
