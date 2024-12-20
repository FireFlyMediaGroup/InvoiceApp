import type { FPLMission } from '../utils/types';

async function getSessionInfo() {
  // This is a placeholder. In a real application, you'd get this from your auth system.
  return JSON.stringify({ user: { id: '123', role: 'USER' } });
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getFPLMissions(): Promise<FPLMission[]> {
  const sessionInfo = await getSessionInfo();
  console.log('Fetching FPL missions');
  const response = await fetch('/api/fpl-missions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Info': sessionInfo,
    },
  });
  return handleResponse(response);
}

export async function createFPLMission(missionData: Partial<FPLMission>): Promise<FPLMission> {
  const sessionInfo = await getSessionInfo();
  console.log('Creating FPL mission', missionData);
  console.log('Session info:', sessionInfo);

  if (!missionData || Object.keys(missionData).length === 0) {
    console.error('Mission data is null or empty');
    throw new Error('Invalid mission data');
  }

  const response = await fetch('/api/fpl-missions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Info': sessionInfo,
    },
    body: JSON.stringify(missionData),
  });
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  return handleResponse(response);
}

export async function updateFPLMission(id: string, missionData: Partial<FPLMission>): Promise<FPLMission> {
  const sessionInfo = await getSessionInfo();
  console.log('Updating FPL mission', id, missionData);
  const response = await fetch('/api/fpl-missions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Info': sessionInfo,
    },
    body: JSON.stringify({ id, ...missionData }),
  });
  return handleResponse(response);
}

export async function deleteFPLMission(id: string): Promise<void> {
  const sessionInfo = await getSessionInfo();
  console.log('Deleting FPL mission', id);
  const response = await fetch('/api/fpl-missions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Info': sessionInfo,
    },
    body: JSON.stringify({ id }),
  });
  return handleResponse(response);
}

export async function approveFPLMission(id: string): Promise<FPLMission> {
  const sessionInfo = await getSessionInfo();
  console.log('Approving FPL mission', id);
  const response = await fetch('/api/fpl-missions', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Info': sessionInfo,
    },
    body: JSON.stringify({ id }),
  });
  return handleResponse(response);
}
