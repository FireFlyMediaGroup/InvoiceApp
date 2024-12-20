'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TailboardDocumentForm } from '../../../components/FPLMissions/Forms/TailboardDocumentForm';
import type { TailboardDocumentFormValues } from '../../../components/FPLMissions/Forms/TailboardDocumentForm';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../../../../components/ui/skeleton';
import { getFPLMissions } from '../../../actions/fplMissions';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';

interface FPLMission {
  id: string;
  siteId: string;
  // Add other properties as needed
}

export default function TailboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [fplMissionId, setFplMissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fplMissions, setFplMissions] = useState<FPLMission[]>([]);

  useEffect(() => {
    fetchFPLMissions();
    const id = searchParams.get('fplMissionId');
    if (id) {
      setFplMissionId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchFPLMissions = async () => {
    try {
      const missions = await getFPLMissions();
      setFplMissions(missions);
    } catch (error) {
      console.error('Error fetching FPL Missions:', error);
      toast.error('Failed to fetch FPL Missions. Please try again.');
    }
  };

  if (status === 'loading') {
    return <Skeleton className="w-full h-64" />;
  }

  const allowedRoles = ['ADMIN', 'SUPERVISOR', 'USER'];
  const userRole = session?.user?.role as string | undefined;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <div>Error: You do not have permission to access this page.</div>;
  }

  const handleSubmit = async (data: TailboardDocumentFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/fpl-missions/tailboard-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify({ user: session?.user }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit tailboard document');
      }

      toast.success('Tailboard document submitted successfully');
      router.push(`/dashboard/fpl-missions/${fplMissionId}`);
    } catch (error) {
      console.error('Error submitting tailboard document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit tailboard document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fplMissions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Create Tailboard Document</h1>
        <p className="mb-4">No FPL Missions found. You need to create an FPL Mission before creating a Tailboard Document.</p>
        <Link href="/dashboard/fpl-missions/new">
          <Button>Create New FPL Mission</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Tailboard Document</h1>
      {!fplMissionId && (
        <div className="mb-4">
          <label htmlFor="fplMission" className="block mb-2">Select FPL Mission:</label>
          <select
            id="fplMission"
            className="w-full p-2 border rounded"
            onChange={(e) => setFplMissionId(e.target.value)}
            value={fplMissionId || ''}
          >
            <option value="">Select an FPL Mission</option>
            {fplMissions.map((mission) => (
              <option key={mission.id} value={mission.id}>
                {mission.siteId}
              </option>
            ))}
          </select>
        </div>
      )}
      {fplMissionId && (
        <>
          <p className="mb-4">Creating document for FPL Mission ID: {fplMissionId}</p>
          <TailboardDocumentForm onSubmit={handleSubmit} fplMissionId={fplMissionId} />
        </>
      )}
      {loading && <div className="mt-4">Submitting document...</div>}
    </div>
  );
}
