import React from 'react';
import { useSession } from 'next-auth/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FPLMission } from '@/app/utils/types';

interface FPLMissionsListProps {
  missions: FPLMission[];
}

export function FPLMissionsList({ missions }: FPLMissionsListProps) {
  const { data: session } = useSession();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">FPL Missions</h2>
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
              <TableCell>{mission.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View
                </Button>
                {(session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'ADMIN') && (
                  <Button variant="outline" size="sm" className="ml-2">
                    Approve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
