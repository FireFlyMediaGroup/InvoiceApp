'use client';

import { useState, useEffect } from 'react';
import { getFPLMissions } from '@/app/actions/fplMissions';
import { notFound, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { FPLMission } from '@/app/utils/types';

interface RiskMatrixData {
  likelihood: string;
  impact: string;
  mitigation: string;
}

export default function RiskMatrixPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mission, setMission] = useState<FPLMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [riskMatrixData, setRiskMatrixData] = useState<RiskMatrixData>({
    likelihood: '',
    impact: '',
    mitigation: '',
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

        // Fetch risk matrix data
        const response = await fetch(`/api/fpl-missions/risk-matrix?missionId=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setRiskMatrixData(data.content);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRiskMatrixData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/fpl-missions/risk-matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          content: riskMatrixData,
          status: 'PENDING',
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error('Failed to save risk matrix');
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
        <p>You do not have permission to view this risk matrix.</p>
      </div>
    );
  }

  const canEditRiskMatrix = isAdminOrSupervisor || (isOwner && mission.status !== 'APPROVED');

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Risk Matrix</h1>
      <p>Mission ID: {mission.id}</p>
      <p>Status: {mission.status}</p>
      
      <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Risk Assessment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="likelihood" className="block mb-1">Likelihood:</label>
            <select 
              id="likelihood"
              name="likelihood"
              className="w-full p-2 border rounded" 
              disabled={!canEditRiskMatrix}
              value={riskMatrixData.likelihood}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="impact" className="block mb-1">Impact:</label>
            <select 
              id="impact"
              name="impact"
              className="w-full p-2 border rounded" 
              disabled={!canEditRiskMatrix}
              value={riskMatrixData.impact}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="mitigation" className="block mb-1">Mitigation Measures:</label>
          <textarea 
            id="mitigation"
            name="mitigation"
            className="w-full p-2 border rounded" 
            rows={4} 
            disabled={!canEditRiskMatrix}
            placeholder="Describe mitigation measures here..."
            value={riskMatrixData.mitigation}
            onChange={handleInputChange}
          />
        </div>
        
        {canEditRiskMatrix && (
          <div className="mt-4">
            <Button type="submit" variant="outline">Save Risk Matrix</Button>
          </div>
        )}
      </form>
    </div>
  );
}
