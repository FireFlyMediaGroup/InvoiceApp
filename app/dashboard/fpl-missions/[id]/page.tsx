import React from 'react';
import Link from 'next/link';
import { getFPLMissions } from '../../../actions/fplMissions';
import { notFound } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { getSession } from 'next-auth/react';

export default async function FPLMissionPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const missions = await getFPLMissions();
  const mission = missions.find(m => m.id === params.id);

  if (!mission) {
    notFound();
  }

  const isAdminOrSupervisor = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';
  const isOwner = mission.userId === session?.user?.id;

  // Check if the user is authorized to view this mission
  if (!isAdminOrSupervisor && !isOwner) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You do not have permission to view this mission.</p>
      </div>
    );
  }

  const canEditMission = isAdminOrSupervisor || (isOwner && mission.status !== 'APPROVED');

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">FPL Mission Details</h1>
      <div className="mb-4">
        <p><strong>ID:</strong> {mission.id}</p>
        <p><strong>Site ID:</strong> {mission.siteId}</p>
        <p><strong>Status:</strong> {mission.status}</p>
        <p><strong>Created At:</strong> {new Date(mission.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(mission.updatedAt).toLocaleString()}</p>
      </div>
      {canEditMission && (
        <div className="flex space-x-4 mb-4">
          <Link href={`/dashboard/fpl-missions/${mission.id}/edit`} passHref>
            <Button variant="outline">Edit Mission</Button>
          </Link>
        </div>
      )}
      <div className="flex space-x-4">
        <Link href={`/dashboard/fpl-missions/${mission.id}/risk-matrix`} passHref>
          <Button variant="outline">Risk Matrix</Button>
        </Link>
        <Link href={`/dashboard/fpl-missions/${mission.id}/mission-planning-script`} passHref>
          <Button variant="outline">Mission Planning Script</Button>
        </Link>
        <Link href={`/dashboard/fpl-missions/${mission.id}/tailboard-document`} passHref>
          <Button variant="outline">Tailboard Document</Button>
        </Link>
      </div>
    </div>
  );
}
