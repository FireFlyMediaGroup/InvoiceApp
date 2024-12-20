import { redirect } from 'next/navigation';
import prisma from 'lib/prisma';
import { auth } from 'app/utils/auth';
import EditFPLMissionForm from '@/app/components/EditFPLMissionForm';

export default async function EditFPLMissionPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session || !session.user || !['ADMIN', 'SUPERVISOR'].includes(session.user.role)) {
    redirect('/unauthorized');
  }

  const missionId = params.id;
  let mission = null;
  let error = null;

  try {
    mission = await prisma.fPLMission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      error = 'Mission not found';
    }
  } catch (e) {
    console.error('Error fetching mission:', e);
    error = 'An error occurred while fetching the mission';
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!mission) {
    return <div className="text-red-500">Unable to load mission data</div>;
  }

  const formattedMission = {
    id: mission.id,
    siteName: mission.siteName,
    status: mission.status,
    siteId: mission.siteId,
  };

  return <EditFPLMissionForm initialMission={formattedMission} />;
}
