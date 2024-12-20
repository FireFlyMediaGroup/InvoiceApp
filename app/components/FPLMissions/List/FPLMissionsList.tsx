'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import type { FPLMission, FPLMissionStatus } from '../../../utils/types';
import { getFPLMissions, createFPLMission, approveFPLMission } from '../../../actions/fplMissions';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../ErrorBoundary';

export function FPLMissionsList() {
  const { data: session } = useSession();
  const [missions, setMissions] = useState<FPLMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      const fetchedMissions = await getFPLMissions();
      setMissions(fetchedMissions);
      setLoading(false);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      setLoading(false);
      toast.error(`Failed to fetch missions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleCreateMission = async () => {
    try {
      const newMission = await createFPLMission({ siteId: 'New Site', status: 'DRAFT' as FPLMissionStatus });
      setMissions([...missions, newMission]);
      toast.success('New mission created successfully');
    } catch (error) {
      toast.error(`Failed to create new mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleApproveMission = async (id: string) => {
    try {
      const updatedMission = await approveFPLMission(id);
      setMissions(missions.map(mission => mission.id === id ? updatedMission : mission));
      toast.success('Mission approved successfully');
    } catch (error) {
      toast.error(`Failed to approve mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const canCreateMission = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'USER';
  const canApproveMission = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorBoundary error={error} reset={fetchMissions} />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">FPL Missions</h2>
      {canCreateMission && (
        <Button onClick={handleCreateMission} className="mb-4">Create New Mission</Button>
      )}
      {missions.length === 0 ? (
        <p>No missions found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell>{mission.siteId}</TableCell>
                <TableCell>{mission.status}</TableCell>
                <TableCell>{new Date(mission.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/fpl-missions/${mission.id}`} passHref>
                    <Button variant="outline" className="text-sm">
                      View
                    </Button>
                  </Link>
                  {canApproveMission && mission.status === 'PENDING' && (
                    <Button 
                      variant="outline" 
                      className="ml-2 text-sm"
                      onClick={() => handleApproveMission(mission.id)}
                    >
                      Approve
                    </Button>
                  )}
                  <Link href={`/dashboard/fpl-missions/tailboard/new?fplMissionId=${mission.id}`} passHref>
                    <Button variant="outline" className="ml-2 text-sm">
                      New Tailboard
                    </Button>
                  </Link>
                  <Link href={`/dashboard/fpl-missions/risk-matrix/new?fplMissionId=${mission.id}`} passHref>
                    <Button variant="outline" className="ml-2 text-sm">
                      New Risk Matrix
                    </Button>
                  </Link>
                  <Link href={`/dashboard/fpl-missions/mission-planning/new?fplMissionId=${mission.id}`} passHref>
                    <Button variant="outline" className="ml-2 text-sm">
                      New Mission Planning
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
