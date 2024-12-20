'use client';

import { useState, useEffect } from 'react';
import { getFPLMissions } from '@/app/actions/fplMissions';
import { notFound, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { FPLMission } from '@/app/utils/types';

interface TailboardDocumentData {
  date: string;
  attendees: string;
  safetyTopics: string;
  hazards: string;
  comments: string;
}

export default function TailboardDocumentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mission, setMission] = useState<FPLMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tailboardData, setTailboardData] = useState<TailboardDocumentData>({
    date: new Date().toISOString().split('T')[0],
    attendees: '',
    safetyTopics: '',
    hazards: '',
    comments: '',
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

        // Fetch tailboard document data
        const response = await fetch(`/api/fpl-missions/tailboard-document?fplMissionId=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setTailboardData(data[0].content);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTailboardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/fpl-missions/tailboard-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fplMissionId: params.id,
          content: tailboardData,
          date: tailboardData.date,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        throw new Error('Failed to save tailboard document');
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
        <p>You do not have permission to view this tailboard document.</p>
      </div>
    );
  }

  const canEditTailboard = isAdminOrSupervisor || (isOwner && mission.status === 'APPROVED');

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Tailboard Document</h1>
      <p>Mission ID: {mission.id}</p>
      <p>Status: {mission.status}</p>
      
      <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Daily Tailboard</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block mb-1">Date:</label>
            <input 
              type="date" 
              id="date"
              name="date"
              className="w-full p-2 border rounded" 
              disabled={!canEditTailboard}
              value={tailboardData.date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="attendees" className="block mb-1">Attendees:</label>
            <textarea 
              id="attendees"
              name="attendees"
              className="w-full p-2 border rounded" 
              rows={3} 
              disabled={!canEditTailboard}
              placeholder="List all attendees..."
              value={tailboardData.attendees}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="safetyTopics" className="block mb-1">Safety Topics Discussed:</label>
            <textarea 
              id="safetyTopics"
              name="safetyTopics"
              className="w-full p-2 border rounded" 
              rows={3} 
              disabled={!canEditTailboard}
              placeholder="Outline safety topics discussed..."
              value={tailboardData.safetyTopics}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="hazards" className="block mb-1">Identified Hazards and Mitigation:</label>
            <textarea 
              id="hazards"
              name="hazards"
              className="w-full p-2 border rounded" 
              rows={3} 
              disabled={!canEditTailboard}
              placeholder="List identified hazards and mitigation strategies..."
              value={tailboardData.hazards}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="comments" className="block mb-1">Additional Comments:</label>
            <textarea 
              id="comments"
              name="comments"
              className="w-full p-2 border rounded" 
              rows={3} 
              disabled={!canEditTailboard}
              placeholder="Any additional comments or notes..."
              value={tailboardData.comments}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        {canEditTailboard && (
          <div className="mt-4">
            <Button type="submit" variant="outline">Save Tailboard Document</Button>
          </div>
        )}
      </form>
    </div>
  );
}
