import { NextResponse } from 'next/server';
import prisma from '../../../utils/db';
import { rbacMiddleware } from '../../../middleware/rbac';

async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('missionId');

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  try {
    const missionPlanningScript = await prisma.missionPlanningScript.findUnique({
      where: {
        fplMissionId: missionId,
      },
    });

    if (!missionPlanningScript) {
      return NextResponse.json({ error: 'Mission Planning Script not found' }, { status: 404 });
    }

    return NextResponse.json(missionPlanningScript);
  } catch (error) {
    console.error('Error fetching Mission Planning Script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePOST(request: Request) {
  try {
    const { content, fplMissionId } = await request.json();
    const newMissionPlanningScript = await prisma.missionPlanningScript.create({
      data: {
        content,
        fplMissionId,
        status: 'DRAFT',
      },
    });
    return NextResponse.json(newMissionPlanningScript, { status: 201 });
  } catch (error) {
    console.error('Error creating Mission Planning Script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePUT(request: Request) {
  try {
    const { id, content, status } = await request.json();
    const updatedMissionPlanningScript = await prisma.missionPlanningScript.update({
      where: { id },
      data: { content, status },
    });
    return NextResponse.json(updatedMissionPlanningScript);
  } catch (error) {
    console.error('Error updating Mission Planning Script:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const PUT = rbacMiddleware(handlePUT, ['USER', 'SUPERVISOR', 'ADMIN']);
