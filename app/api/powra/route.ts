import { PrismaClient, Prisma, POWRAStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { rbacMiddleware } from "app/middleware/rbac";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prismaClient;

function getSession(request: NextRequest) {
  console.log('[getSession] Request headers:', request.headers);
  const userInfo = request.headers.get('X-User-Info');
  console.log('[getSession] X-User-Info header:', userInfo);
  if (!userInfo) {
    console.error('[getSession] No X-User-Info header found');
    return null;
  }
  try {
    const session = JSON.parse(userInfo);
    console.log('[getSession] Parsed session:', session);
    return session;
  } catch (error) {
    console.error('[getSession] Error parsing X-User-Info header:', error);
    return null;
  }
}

const riskSchema = z.enum(['L', 'M', 'H']);

const controlMeasureSchema = z.object({
  id: z.string().optional(),
  hazardNo: z.string(),
  measures: z.string(),
  risk: riskSchema,
});

const powraSchema = z.object({
  site: z.string().nonempty(),
  status: z.nativeEnum(POWRAStatus),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  time: z.string(),
  pilotName: z.string(),
  location: z.string(),
  chiefPilot: z.string(),
  hse: z.string(),
  beforeStartChecklist: z.array(z.string()),
  reviewNames: z.array(z.string()),
  reviewDates: z.array(z.string().or(z.date()).transform((val) => new Date(val))),
  lessonsLearned: z.boolean(),
  reviewComments: z.string().nullable().optional(),
  controlMeasures: z.object({
    create: z.array(controlMeasureSchema).optional(),
    upsert: z.array(z.object({
      where: z.object({ id: z.string() }),
      update: controlMeasureSchema,
      create: controlMeasureSchema,
    })).optional(),
    deleteMany: z.object({
      id: z.object({ notIn: z.array(z.string()) }),
    }).optional(),
  }),
});

function logDebug(message: string, data?: unknown) {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

async function handleGET(request: NextRequest) {
  try {
    console.log('[handleGET] Started');
    logDebug('Handling GET request', { url: request.url });
    const session = getSession(request);
    logDebug('Session', session);

    if (!session || !session.user) {
      logDebug('Unauthorized: No valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const page = Math.max(Number.parseInt(url.searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(Number.parseInt(url.searchParams.get('pageSize') || '10', 10), 1), 100);

    logDebug('Query parameters', { id, page, pageSize });

    if (id) {
      logDebug('Fetching single POWRA', { id });
      const powra = await prismaClient.pOWRA.findUnique({
        where: { id },
        include: { controlMeasures: true },
      });

      if (!powra) {
        logDebug('POWRA not found', { id });
        return NextResponse.json({ error: 'POWRA not found' }, { status: 404 });
      }

      logDebug('POWRA found', powra);
      return NextResponse.json(powra);
    }

    logDebug('Fetching multiple POWRAs', { userId: session.user.id, page, pageSize });
    const powras = await prismaClient.pOWRA.findMany({
      where: { userId: session.user.id },
      include: { controlMeasures: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prismaClient.pOWRA.count({ where: { userId: session.user.id } });

    logDebug('POWRAs fetched', { count: powras.length, total });
    return NextResponse.json({ data: powras, total, page, pageSize });
  } catch (error) {
    console.error('[handleGET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handlePOST(request: NextRequest) {
  try {
    console.log('[handlePOST] Started');
    const session = getSession(request);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    logDebug('Received POST body:', body);

    const validatedData = powraSchema.parse(body);
    logDebug('Validated data:', validatedData);

    const newPOWRA = await prismaClient.pOWRA.create({
      data: {
        ...validatedData,
        user: { connect: { id: session.user.id } },
      },
      include: { controlMeasures: true },
    });

    logDebug('Created POWRA:', newPOWRA);

    return NextResponse.json(newPOWRA, { status: 201 });
  } catch (error) {
    console.error('[handlePOST] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logDebug('Prisma error:', { code: error.code, message: error.message, meta: error.meta });
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handlePUT(request: NextRequest) {
  try {
    console.log('[handlePUT] Started');
    const session = getSession(request);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'POWRA ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = powraSchema.parse(body);

    const updatedPOWRA = await prismaClient.pOWRA.update({
      where: { id },
      data: {
        ...validatedData,
        user: { connect: { id: session.user.id } },
      },
      include: { controlMeasures: true },
    });

    return NextResponse.json(updatedPOWRA);
  } catch (error) {
    console.error('[handlePUT] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'POWRA not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handleDELETE(request: NextRequest) {
  try {
    console.log('[handleDELETE] Started');
    const session = getSession(request);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'POWRA ID is required' }, { status: 400 });
    }

    await prismaClient.pOWRA.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'POWRA deleted successfully' });
  } catch (error) {
    console.error('[handleDELETE] Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'POWRA not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
export const POST = rbacMiddleware(handlePOST, ['USER', 'SUPERVISOR', 'ADMIN']);
export const PUT = rbacMiddleware(handlePUT, ['USER', 'SUPERVISOR', 'ADMIN']);
export const DELETE = rbacMiddleware(handleDELETE, ['SUPERVISOR', 'ADMIN']);
