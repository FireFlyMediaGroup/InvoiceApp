import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../utils/db';
import { rbacMiddleware } from '../../middleware/rbac';
import { z } from 'zod';
import { logError } from '../../utils/monitoring';

const missionPlanningScriptSchema = z.object({
  content: z.string().min(1, 'Mission planning script content is required'),
  site: z.string().min(1, 'Site is required'),
  fplMissionId: z.string().min(1, 'FPL Mission ID is required'),
});

async function handlePOST(req: NextRequest) {
  try {
    console.log('[Mission Planning Script POST] Received POST request for Mission Planning Script');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;

    if (!userId) {
      console.log('[Mission Planning Script POST] User ID not found in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[Mission Planning Script POST] Request body:', body);

    const validatedData = missionPlanningScriptSchema.parse(body);
    console.log('[Mission Planning Script POST] Validated data:', validatedData);

    const newMissionPlanningScript = await prisma.missionPlanningScript.create({
      data: {
        ...validatedData,
        userId,
      },
    });
    console.log('[Mission Planning Script POST] New mission planning script created:', newMissionPlanningScript);
    return NextResponse.json(newMissionPlanningScript, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Mission Planning Script POST] Zod validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('[Mission Planning Script POST] Error creating mission planning script', error);
    return NextResponse.json({ error: 'Failed to create mission planning script' }, { status: 500 });
  }
}

async function handleGET(req: NextRequest) {
  try {
    console.log('[Mission Planning Script GET] Received GET request for Mission Planning Scripts');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId) {
      console.log('[Mission Planning Script GET] User ID not found in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const missionPlanningScripts = await prisma.missionPlanningScript.findMany({
      where: userRole === 'ADMIN' || userRole === 'SUPERVISOR' ? {} : { userId },
    });

    console.log(`[Mission Planning Script GET] Retrieved ${missionPlanningScripts.length} mission planning scripts`);
    return NextResponse.json(missionPlanningScripts);
  } catch (error) {
    logError('[Mission Planning Script GET] Error fetching mission planning scripts', error);
    return NextResponse.json({ error: 'Failed to fetch mission planning scripts' }, { status: 500 });
  }
}

export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
