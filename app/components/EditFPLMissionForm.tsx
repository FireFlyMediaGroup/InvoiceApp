'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useApi } from "@/app/hooks/useApi";
import type { FormEvent } from 'react';

type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED';

interface FPLMission {
  id: string;
  siteName: string;
  status: DocumentStatus;
  siteId: string;
}

interface EditFPLMissionFormProps {
  initialMission: FPLMission;
}

export default function EditFPLMissionForm({ initialMission }: EditFPLMissionFormProps) {
  const [mission, setMission] = useState<FPLMission>(initialMission);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { fetchWithAuth } = useApi();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/api/fpl-missions/${mission.id}?type=fpl-mission`, {
        method: 'PUT',
        body: JSON.stringify(mission),
      });
      router.push('/dashboard/fpl-missions');
    } catch (error) {
      console.error('Error updating mission:', error);
      setError('Failed to update mission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMission = (updates: Partial<FPLMission>) => {
    setMission((prev) => ({ ...prev, ...updates }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit FPL Mission: {mission.siteName}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={mission.siteName}
              onChange={(e) => updateMission({ siteName: e.target.value })}
              placeholder="Site Name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="siteId">Site ID</Label>
            <Input
              id="siteId"
              value={mission.siteId}
              onChange={(e) => updateMission({ siteId: e.target.value })}
              placeholder="Site ID"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={mission.status}
              onValueChange={(value: DocumentStatus) => updateMission({ status: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/fpl-missions')} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
