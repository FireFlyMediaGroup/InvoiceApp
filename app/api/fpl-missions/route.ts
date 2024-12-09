import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utils/db';
import { getToken } from 'next-auth/jwt';

async function getUserFromToken(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || !token.sub) {
    return null;
  }
  return { id: token.sub };
}

export async function GET(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const missions = await prisma.fPLMission.findMany({
      where: {
        userId: user.id,
      },
    });
    return NextResponse.json(missions);
  } catch (error) {
    console.error('Error fetching FPL missions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const newMission = await prisma.fPLMission.create({
      data: {
        ...data,
        userId: user.id,
      },
    });
    return NextResponse.json(newMission, { status: 201 });
  } catch (error) {
    console.error('Error creating FPL mission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    const updatedMission = await prisma.fPLMission.update({
      where: { id, userId: user.id },
      data: updateData,
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    console.error('Error updating FPL mission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    await prisma.fPLMission.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    console.error('Error deleting FPL mission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
