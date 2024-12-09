import { NextResponse } from 'next/server';
import prisma from '@/app/utils/db';
import { auth } from '@/app/utils/auth';
import { PrismaClient } from '@prisma/client';

interface RiskMatrix {
  id: string;
  status: string;
  content: string;
  fplMissionId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RiskMatrixFindUniqueArgs {
  where: {
    fplMissionId: string;
  };
}

interface RiskMatrixCreateArgs {
  data: Partial<RiskMatrix>;
}

type PrismaClientWithRiskMatrix = PrismaClient & {
  riskMatrix: {
    // eslint-disable-next-line no-unused-vars
    findUnique: (args: RiskMatrixFindUniqueArgs) => Promise<RiskMatrix | null>;
    // eslint-disable-next-line no-unused-vars
    create: (args: RiskMatrixCreateArgs) => Promise<RiskMatrix>;
  };
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('missionId');

  if (!missionId) {
    return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
  }

  try {
    const riskMatrix = await (prisma as PrismaClientWithRiskMatrix).riskMatrix.findUnique({
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

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, fplMissionId } = await request.json();
    const newRiskMatrix = await (prisma as PrismaClientWithRiskMatrix).riskMatrix.create({
      data: {
        content,
        fplMissionId,
      },
    });
    return NextResponse.json(newRiskMatrix);
  } catch (error) {
    console.error('Error creating Risk Matrix:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
