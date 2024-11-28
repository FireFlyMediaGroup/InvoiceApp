import { PrismaClient } from '@prisma/client';
import type { POWRAStatus, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '../../utils/auth';

const prisma = new PrismaClient();

async function getSession(request: Request) {
  const testAuth = request.headers.get('X-Test-Auth');
  if (testAuth) {
    return JSON.parse(testAuth);
  }
  return await auth();
}

interface ControlMeasure {
  id: number;
  hazardNo: string;
  measures: string;
  risk: 'L' | 'M' | 'H';
}

interface POWRAData {
  status: POWRAStatus;
  headerFields: Record<string, string>;
  beforeStartChecklist: string[];
  controlMeasures: ControlMeasure[];
  reviewComments?: string;
}

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    console.log('Auth session:', session);

    if (!session || !session.user) {
      console.log('Unauthorized: No valid session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Fetch a single POWRA
      const powra = await prisma.pOWRA.findUnique({
        where: {
          id: id,
          userId: session.user.id,
        },
      });

      if (!powra) {
        console.log(`POWRA not found for id: ${id}`);
        return NextResponse.json({ error: 'POWRA not found' }, { status: 404 });
      }

      return NextResponse.json(powra);
    }

    // Fetch all POWRAs for the user
    const powras = await prisma.pOWRA.findMany({
      where: {
        userId: session.user.id,
      },
    });

    console.log(`Found ${powras.length} POWRAs for user ${session.user.id}`);
    return NextResponse.json(powras);
  } catch (error) {
    console.error('Error in GET /api/powra:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    console.log('Auth session:', session);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: POWRAData = await request.json();
    console.log('Received POWRA data:', data);

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Ensure required fields are present
    const requiredFields: (keyof POWRAData)[] = [
      'status',
      'headerFields',
      'beforeStartChecklist',
      'controlMeasures',
    ];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newPOWRA = await prisma.pOWRA.create({
      data: {
        status: data.status,
        headerFields: JSON.parse(
          JSON.stringify(data.headerFields)
        ) as Prisma.InputJsonValue,
        beforeStartChecklist: JSON.parse(
          JSON.stringify(data.beforeStartChecklist)
        ) as Prisma.InputJsonValue,
        controlMeasures: JSON.parse(
          JSON.stringify(data.controlMeasures)
        ) as Prisma.InputJsonValue,
        reviewComments: data.reviewComments,
        userId: session.user.id,
      },
    });

    console.log('Created POWRA:', newPOWRA);
    return NextResponse.json(newPOWRA);
  } catch (error) {
    console.error('Error creating POWRA:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getSession(request);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'POWRA ID is required' },
        { status: 400 }
      );
    }

    const data: POWRAData = await request.json();
    const updatedPOWRA = await prisma.pOWRA.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        status: data.status,
        headerFields: JSON.parse(
          JSON.stringify(data.headerFields)
        ) as Prisma.InputJsonValue,
        beforeStartChecklist: JSON.parse(
          JSON.stringify(data.beforeStartChecklist)
        ) as Prisma.InputJsonValue,
        controlMeasures: JSON.parse(
          JSON.stringify(data.controlMeasures)
        ) as Prisma.InputJsonValue,
        reviewComments: data.reviewComments,
      },
    });

    return NextResponse.json(updatedPOWRA);
  } catch (error) {
    console.error('Error updating POWRA:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getSession(request);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'POWRA ID is required' },
        { status: 400 }
      );
    }

    await prisma.pOWRA.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: 'POWRA deleted successfully' });
  } catch (error) {
    console.error('Error deleting POWRA:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
