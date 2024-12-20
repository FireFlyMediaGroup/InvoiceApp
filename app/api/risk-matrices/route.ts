import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../utils/db';
import { rbacMiddleware } from '../../middleware/rbac';
import { z } from 'zod';
import { logError } from '../../utils/monitoring';

const riskMatrixSchema = z.object({
  content: z.string().min(1, 'Risk matrix content is required'),
  site: z.string().min(1, 'Site is required'),
  fplMissionId: z.string().min(1, 'FPL Mission ID is required'),
});

async function handlePOST(req: NextRequest) {
  try {
    console.log('[Risk Matrix POST] Received POST request for Risk Matrix');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;

    if (!userId) {
      console.log('[Risk Matrix POST] User ID not found in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[Risk Matrix POST] Request body:', body);

    const validatedData = riskMatrixSchema.parse(body);
    console.log('[Risk Matrix POST] Validated data:', validatedData);

    const newRiskMatrix = await prisma.riskMatrix.create({
      data: {
        ...validatedData,
        userId,
      },
    });
    console.log('[Risk Matrix POST] New risk matrix created:', newRiskMatrix);
    return NextResponse.json(newRiskMatrix, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Risk Matrix POST] Zod validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('[Risk Matrix POST] Error creating risk matrix', error);
    return NextResponse.json({ error: 'Failed to create risk matrix' }, { status: 500 });
  }
}

async function handleGET(req: NextRequest) {
  try {
    console.log('[Risk Matrix GET] Received GET request for Risk Matrices');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId) {
      console.log('[Risk Matrix GET] User ID not found in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const riskMatrices = await prisma.riskMatrix.findMany({
      where: userRole === 'ADMIN' || userRole === 'SUPERVISOR' ? {} : { userId },
    });

    console.log(`[Risk Matrix GET] Retrieved ${riskMatrices.length} risk matrices`);
    return NextResponse.json(riskMatrices);
  } catch (error) {
    logError('[Risk Matrix GET] Error fetching risk matrices', error);
    return NextResponse.json({ error: 'Failed to fetch risk matrices' }, { status: 500 });
  }
}

export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
