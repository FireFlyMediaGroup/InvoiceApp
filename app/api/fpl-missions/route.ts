import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../utils/db';
import { rbacMiddleware } from '../../middleware/rbac';
import { z } from 'zod';
import { logError } from '../../utils/monitoring';

const missionSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  siteName: z.string().min(1, "Site Name is required"),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED'] as const),
  site: z.string().min(1, "Site is required"),
});

interface SessionUser {
  user?: {
    id: string;
    role: string;
  };
}

async function handleGET(req: NextRequest) {
  try {
    console.log('[FPL Mission GET] Received GET request for FPL missions');
    const sessionHeader = req.headers.get('X-User-Info');
    console.log('[FPL Mission GET] X-User-Info header:', sessionHeader);

    if (!sessionHeader) {
      console.log('[FPL Mission GET] X-User-Info header is missing');
      return NextResponse.json({ error: 'User information is missing' }, { status: 400 });
    }

    let session: SessionUser;
    try {
      session = JSON.parse(sessionHeader);
    } catch (parseError) {
      console.error('[FPL Mission GET] Error parsing X-User-Info:', parseError);
      return NextResponse.json({ error: 'Invalid user information format' }, { status: 400 });
    }

    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId || !userRole) {
      console.log('[FPL Mission GET] User ID or role not found in session');
      return NextResponse.json({ error: 'User ID or role not found in session' }, { status: 400 });
    }

    console.log(`[FPL Mission GET] User ID: ${userId}, Role: ${userRole}`);

    const missions = await prisma.fPLMission.findMany({
      where: userRole === 'ADMIN' || userRole === 'SUPERVISOR' ? {} : { userId },
      include: {
        document: {
          select: {
            status: true,
            site: true,
          },
        },
        rpic: {
          select: {
            status: true,
          },
        },
      },
    });
    console.log(`[FPL Mission GET] Retrieved ${missions.length} missions`);
    return NextResponse.json(missions);
  } catch (error) {
    console.error('[FPL Mission GET] Error fetching FPL missions:', error);
    logError('[FPL Mission GET] Error fetching FPL missions', error);
    return NextResponse.json({ error: 'Failed to fetch FPL missions' }, { status: 500 });
  }
}

async function handlePOST(req: NextRequest) {
  try {
    console.log('[FPL Mission POST] Received POST request for FPL mission');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId || !userRole) {
      console.log('[FPL Mission POST] User ID or role not found in session');
      return NextResponse.json({ error: 'User ID or role not found in session' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[FPL Mission POST] Request body:', body);

    const validatedData = missionSchema.parse(body);
    console.log('[FPL Mission POST] Validated data:', validatedData);

    const newMission = await prisma.fPLMission.create({
      data: {
        ...validatedData,
        userId,
        document: {
          create: {
            status: 'DRAFT',
            content: '',
            site: validatedData.site,
          },
        },
        rpic: {
          create: {
            status: 'DRAFT',
            content: '',
          },
        },
      },
      include: {
        document: {
          select: {
            status: true,
            site: true,
          },
        },
        rpic: {
          select: {
            status: true,
          },
        },
      },
    });
    console.log('[FPL Mission POST] New mission created:', newMission);
    return NextResponse.json(newMission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[FPL Mission POST] Zod validation error:', error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('[FPL Mission POST] Error creating FPL mission', error);
    return NextResponse.json({ error: 'Failed to create FPL mission' }, { status: 500 });
  }
}

async function handlePUT(req: NextRequest) {
  try {
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'User ID or role not found in session' }, { status: 400 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    const validatedData = missionSchema.partial().parse(updateData);

    const mission = await prisma.fPLMission.findUnique({ where: { id } });
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (mission.status === 'APPROVED' && userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Cannot modify approved mission' }, { status: 403 });
    }

    const updatedMission = await prisma.fPLMission.update({
      where: { id },
      data: {
        ...validatedData,
        document: validatedData.site
          ? {
              update: {
                site: validatedData.site,
              },
            }
          : undefined,
      },
      include: {
        document: {
          select: {
            status: true,
            site: true,
          },
        },
        rpic: {
          select: {
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logError('Error updating FPL mission', error);
    return NextResponse.json({ error: 'Failed to update FPL mission' }, { status: 500 });
  }
}

async function handleDELETE(req: NextRequest) {
  try {
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'User ID or role not found in session' }, { status: 400 });
    }

    const { id } = await req.json();

    const mission = await prisma.fPLMission.findUnique({ where: { id } });
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.userId !== userId && userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.fPLMission.delete({ where: { id } });

    return NextResponse.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    logError('Error deleting FPL mission', error);
    return NextResponse.json({ error: 'Failed to delete FPL mission' }, { status: 500 });
  }
}

async function handlePATCH(req: NextRequest) {
  try {
    console.log('[FPL Mission PATCH] Received PATCH request for FPL mission approval');
    const session = JSON.parse(req.headers.get('X-User-Info') || '{}');
    const userId = session.user?.id;
    const userRole = session.user?.role;

    if (!userId || !userRole) {
      console.log('[FPL Mission PATCH] User ID or role not found in session');
      return NextResponse.json({ error: 'User ID or role not found in session' }, { status: 400 });
    }

    if (userRole !== 'ADMIN' && userRole !== 'SUPERVISOR') {
      console.log('[FPL Mission PATCH] Unauthorized role for approval');
      return NextResponse.json({ error: 'Unauthorized to approve missions' }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      console.log('[FPL Mission PATCH] Mission ID not provided');
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    const mission = await prisma.fPLMission.findUnique({ where: { id } });
    if (!mission) {
      console.log('[FPL Mission PATCH] Mission not found');
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.status !== 'PENDING') {
      console.log('[FPL Mission PATCH] Mission is not in PENDING status');
      return NextResponse.json({ error: 'Only PENDING missions can be approved' }, { status: 400 });
    }

    const updatedMission = await prisma.fPLMission.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        document: {
          select: {
            status: true,
            site: true,
          },
        },
        rpic: {
          select: {
            status: true,
          },
        },
      },
    });

    console.log('[FPL Mission PATCH] Mission approved successfully');
    return NextResponse.json(updatedMission);
  } catch (error) {
    logError('[FPL Mission PATCH] Error approving FPL mission', error);
    return NextResponse.json({ error: 'Failed to approve FPL mission' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const PUT = rbacMiddleware(handlePUT, ['USER', 'SUPERVISOR', 'ADMIN']);
export const DELETE = rbacMiddleware(handleDELETE, ['USER', 'SUPERVISOR', 'ADMIN']);
export const PATCH = rbacMiddleware(handlePATCH, ['SUPERVISOR', 'ADMIN']);
