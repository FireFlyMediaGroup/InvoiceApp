'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

interface FPLMission {
  id: string;
  siteName: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  siteId: string;
  createdAt: string;
  updatedAt: string;
  document?: {
    status: 'DRAFT' | 'PENDING' | 'APPROVED';
    content: string;
  };
  rpic?: {
    status: 'DRAFT' | 'PENDING' | 'APPROVED';
    content: string;
  };
  tailboards?: Array<{
    id: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED';
    date: string;
  }>;
}

// Extended Session type to match our custom session structure
interface ExtendedSession {
  user?: {
    id: string;
    email?: string | null;
    isAllowed: boolean;
    role: string;
  };
}

export default function ViewFPLMission() {
  const [mission, setMission] = useState<FPLMission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: "loading" | "authenticated" | "unauthenticated" };

  const fetchMission = useCallback(async (id: string) => {
    console.log('Fetching mission, session status:', status);
    console.log('Session data:', session);

    if (status === "loading") {
      console.log('Session is still loading, waiting...');
      return;
    }
    if (!session?.user) {
      console.log('No user in session, setting error');
      setError('You must be logged in to view this page');
      return;
    }

    try {
      console.log('Sending fetch request for mission:', id);
      const response = await fetch(`/api/fpl-missions/${id}?type=fpl-mission`, {
        credentials: 'include',
      });
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch mission: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched mission data:', data);
      setMission(data);
    } catch (error) {
      console.error('Error fetching mission:', error);
      setError('Failed to load mission. Please try again.');
    }
  }, [session, status]);

  useEffect(() => {
    console.log('useEffect triggered, params:', params);
    const missionId = params.id;
    if (typeof missionId === 'string') {
      fetchMission(missionId);
    }
  }, [fetchMission, params]);

  const handleCreateTailboard = () => {
    const missionId = params.id;
    if (typeof missionId === 'string') {
      router.push(`/dashboard/fpl-missions/${missionId}/tailboard/new`);
    }
  };

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (!session?.user) {
    return <div>Please log in to view this page.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!mission) {
    return <div>Loading mission data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>View FPL Mission: {mission.siteName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Status:</strong> <Badge>{mission.status}</Badge>
          </div>
          <div>
            <strong>Site ID:</strong> {mission.siteId}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(mission.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Updated At:</strong> {new Date(mission.updatedAt).toLocaleString()}
          </div>
          {mission.document && (
            <div>
              <strong>Document Status:</strong> <Badge>{mission.document.status}</Badge>
            </div>
          )}
          {mission.rpic && (
            <div>
              <strong>RPIC Status:</strong> <Badge>{mission.rpic.status}</Badge>
            </div>
          )}
          {mission.tailboards && mission.tailboards.length > 0 && (
            <div>
              <strong>Tailboards:</strong>
              <ul>
                {mission.tailboards.map((tailboard) => (
                  <li key={tailboard.id}>
                    Date: {new Date(tailboard.date).toLocaleDateString()} - Status: <Badge>{tailboard.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-4 space-x-2">
          <Button onClick={() => {
            const missionId = params.id;
            if (typeof missionId === 'string') {
              router.push(`/dashboard/fpl-missions/${missionId}/edit`);
            }
          }}>
            Edit
          </Button>
          <Button onClick={handleCreateTailboard}>
            New Tailboard
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/fpl-missions')}>
            Back to List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
