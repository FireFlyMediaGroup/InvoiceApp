'use client';

import { useState, useEffect } from 'react';
import { getFPLMissions } from '../../../../actions/fplMissions';
import { notFound, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../../../components/ui/button';
import type { FPLMission } from '../../../../utils/types';

interface MissionPlanningScriptData {
  objective: string;
  resources: string;
  timeline: string;
  contingency: string;
}

interface PageProps {
  params: { id: string };
}

export default function MissionPlanningScriptPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mission, setMission] = useState<FPLMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [scriptData, setScriptData] = useState<MissionPlanningScriptData>({
    objective: '',
    resources: '',
    timeline: '',
    contingency: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const missions = await getFPLMissions();
        const foundMission = missions.find((m: FPLMission) => m.id === params.id);
        if (!foundMission) {
          notFound();
        }
        setMission(foundMission);

        // Fetch mission planning script data
        const response = await fetch(`/api/fpl-missions/mission-planning-script?missionId=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setScriptData(data.content);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScriptData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/fpl-missions/mission-planning-script', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          content: scriptData,
          status: 'PENDING',
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error('Failed to save mission planning script');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error.message}</p>
        <Button onClick={() => router.refresh()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (!mission) {
    return <div>Mission not found</div>;
  }

  const isAdminOrSupervisor = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';
  const isOwner = mission.userId === session?.user?.id;

  if (!isAdminOrSupervisor && !isOwner) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to view this mission planning script.</p>
      </div>
    );
  }

  const canEditScript = isAdminOrSupervisor || (isOwner && mission.status !== 'APPROVED');

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Mission Planning Script</h1>
      <p>Mission ID: {mission.id}</p>
      <p>Status: {mission.status}</p>
      <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Mission Details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="objective" className="block mb-1">Mission Objective:</label>
            <textarea 
              id="objective"
              name="objective"
              className="w-full p-2 border rounded"
              value={scriptData.objective}
              onChange={handleInputChange}
              disabled={!canEditScript}
            />
          </div>
          <div>
            <label htmlFor="resources" className="block mb-1">Resources:</label>
            <textarea 
              id="resources"
              name="resources"
              className="w-full p-2 border rounded"
              value={scriptData.resources}
              onChange={handleInputChange}
              disabled={!canEditScript}
            />
          </div>
          <div>
            <label htmlFor="timeline" className="block mb-1">Timeline:</label>
            <textarea 
              id="timeline"
              name="timeline"
              className="w-full p-2 border rounded"
              value={scriptData.timeline}
              onChange={handleInputChange}
              disabled={!canEditScript}
            />
          </div>
          <div>
            <label htmlFor="contingency" className="block mb-1">Contingency Plan:</label>
            <textarea 
              id="contingency"
              name="contingency"
              className="w-full p-2 border rounded"
              value={scriptData.contingency}
              onChange={handleInputChange}
              disabled={!canEditScript}
            />
          </div>
        </div>
        {canEditScript && (
          <Button type="submit" className="mt-4">Save Mission Planning Script</Button>
        )}
      </form>
    </div>
  );
}
