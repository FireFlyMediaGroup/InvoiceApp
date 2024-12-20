import { getFPLMissions } from '../../../../actions/fplMissions';

export async function generateStaticParams() {
  const missions = await getFPLMissions();
  return missions.map((mission) => ({
    id: mission.id,
  }));
}
