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
    const riskMatrix = await prisma.riskMatrix.findUnique({
      where: {
        fplMissionId: missionId,
      },
    });

    if (!riskMatrix) {
      return NextResponse.json({ error: 'Risk Matrix not found' }, { status: 404 });
    }

    return NextResponse.json(riskMatrix);
  } catch (error) {
    console.error('Error fetching Risk Matrix:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePOST(request: Request) {
  try {
    const { content, fplMissionId } = await request.json();
    const newRiskMatrix = await prisma.riskMatrix.create({
      data: {
        content,
        fplMissionId,
        status: 'DRAFT',
      },
    });
    return NextResponse.json(newRiskMatrix, { status: 201 });
  } catch (error) {
    console.error('Error creating Risk Matrix:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePUT(request: Request) {
  try {
    const { id, content, status } = await request.json();
    const updatedRiskMatrix = await prisma.riskMatrix.update({
      where: { id },
      data: { content, status },
    });
    return NextResponse.json(updatedRiskMatrix);
  } catch (error) {
    console.error('Error updating Risk Matrix:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const PUT = rbacMiddleware(handlePUT, ['USER', 'SUPERVISOR', 'ADMIN']);
