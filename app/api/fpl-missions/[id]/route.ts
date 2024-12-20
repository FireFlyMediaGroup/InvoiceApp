import { NextResponse } from 'next/server';
import prisma from 'lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id;

    const mission = await prisma.fPLMission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ message: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error('[FPL Missions API] Error fetching FPL Mission:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id;
    const data = await request.json();

    // Validate incoming data
    if (!data.siteName || !data.siteId || !data.status) {
      return NextResponse.json({ message: 'Invalid data provided' }, { status: 400 });
    }

    const updatedMission = await prisma.fPLMission.update({
      where: { id: missionId },
      data: {
        siteName: data.siteName,
        siteId: data.siteId,
        status: data.status,
      },
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error('[FPL Missions API] Error updating FPL Mission:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id;

    const deletedMission = await prisma.fPLMission.delete({
      where: { id: missionId },
    });

    if (!deletedMission) {
      return NextResponse.json({ message: 'Mission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'FPL Mission deleted successfully' });
  } catch (error) {
    console.error('[FPL Missions API] Error deleting FPL Mission:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
