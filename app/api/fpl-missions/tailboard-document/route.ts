import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../../utils/db';
import { rbacMiddleware } from '../../../middleware/rbac';
import { z } from 'zod';

const tailboardContentSchema = z.object({
  pilotName: z.string().min(1, 'Pilot name is required'),
  tailboardReviewNotes: z.string().max(500, 'Tailboard review notes must be 500 characters or less'),
  preFlightBriefingNotes: z.string().max(500, 'Pre-flight briefing notes must be 500 characters or less'),
  rulesRegulationsReviewNotes: z.string().max(500, 'Rules review notes must be 500 characters or less'),
  flightPlanReviewNotes: z.string().max(500, 'Flight plan review notes must be 500 characters or less'),
  signatureRPIC: z.string().min(1, 'RPIC signature is required'),
});

const tailboardCreateSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  pilotName: z.string().min(1, 'RPIC Name is required'),
  tailboardComplete: z.literal(true, {
    errorMap: () => ({ message: 'Tailboard must be completed' }),
  }),
  tailboardReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  preFlightBriefingComplete: z.literal(true, {
    errorMap: () => ({ message: 'Pre-Flight Briefing must be completed' }),
  }),
  preFlightBriefingNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  rulesRegulationsReviewComplete: z.literal(true, {
    errorMap: () => ({ message: 'Rules and Regulations Review must be completed' }),
  }),
  rulesRegulationsReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  flightPlanReviewComplete: z.literal(true, {
    errorMap: () => ({ message: 'Flight Plan Review must be completed' }),
  }),
  flightPlanReviewNotes: z.string().max(500, 'Notes must be 500 characters or less'),
  signatureRPIC: z.string().min(1, 'RPIC signature is required'),
  dateRPIC: z.string().min(1, 'RPIC date is required'),
  signatureFlightCrew1: z.string().optional(),
  dateFlightCrew1: z.string().optional(),
  signatureFlightCrew2: z.string().optional(),
  dateFlightCrew2: z.string().optional(),
  signatureFlightCrew3: z.string().optional(),
  dateFlightCrew3: z.string().optional(),
  fplMissionId: z.string().min(1, 'FPL Mission ID is required'),
});

const tailboardUpdateSchema = z.object({
  content: tailboardContentSchema,
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED']).optional(),
});

interface WhereClause {
  createdById?: string;
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | { in: ('DRAFT' | 'PENDING' | 'APPROVED')[] };
  fplMissionId?: string;
  date?: { gte: Date; lte: Date };
}

async function handler(req: NextRequest) {
  console.log('[Tailboard API] Handler called');
  const userInfo = req.headers.get('X-User-Info');
  if (!userInfo) {
    console.log('[Tailboard API] Unauthorized: No X-User-Info header');
    return NextResponse.json({ error: 'Unauthorized: Missing user information' }, { status: 401 });
  }

  const session = JSON.parse(userInfo);
  if (!session || !session.user) {
    console.log('[Tailboard API] Unauthorized: Invalid session or user');
    return NextResponse.json({ error: 'Unauthorized: Invalid session or user' }, { status: 401 });
  }

  if (req.method === 'POST') {
    return handleCreate(req, session);
  }
  
  if (req.method === 'PUT') {
    return handleUpdate(req, session);
  }
  
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== 'tailboard-document') {
      return handleGetSingle(req, session, id);
    }
    return handleGet(req, session);
  }
  
  console.log('[Tailboard API] Method not allowed:', req.method);
  return NextResponse.json({ error: `Method Not Allowed: ${req.method}` }, { status: 405 });
}

async function handleCreate(req: NextRequest, session: { user: { id: string; role: string } }) {
  console.log('[Tailboard API] handleCreate called');
  try {
    const body = await req.json();
    const validatedData = tailboardCreateSchema.parse(body);

    const fplMission = await prisma.fPLMission.findUnique({
      where: { id: validatedData.fplMissionId },
    });

    if (!fplMission) {
      console.log('[Tailboard API] FPL Mission not found:', validatedData.fplMissionId);
      return NextResponse.json({ error: 'FPL Mission not found' }, { status: 404 });
    }

    if (fplMission.userId !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
      console.log('[Tailboard API] Unauthorized to create document for FPL Mission:', validatedData.fplMissionId);
      return NextResponse.json({ error: 'Unauthorized to create document for this FPL Mission' }, { status: 403 });
    }

    const tailboardDocument = await prisma.tailboardDocument.create({
      data: {
        content: JSON.stringify({
          pilotName: validatedData.pilotName,
          tailboardReviewNotes: validatedData.tailboardReviewNotes,
          preFlightBriefingNotes: validatedData.preFlightBriefingNotes,
          rulesRegulationsReviewNotes: validatedData.rulesRegulationsReviewNotes,
          flightPlanReviewNotes: validatedData.flightPlanReviewNotes,
          signatureRPIC: validatedData.signatureRPIC,
        }),
        fplMissionId: validatedData.fplMissionId,
        date: new Date(validatedData.date),
        status: 'DRAFT',
        createdById: session.user.id,
      },
    });

    console.log('[Tailboard API] Document created successfully:', tailboardDocument.id);
    return NextResponse.json(tailboardDocument, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Tailboard API] Validation error:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[Tailboard API] Error creating tailboard document:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handleUpdate(req: NextRequest, session: { user: { id: string; role: string } }) {
  console.log('[Tailboard API] handleUpdate called');
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    console.log('[Tailboard API] Missing document ID');
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  try {
    const existingDocument = await prisma.tailboardDocument.findUnique({
      where: { id },
      include: { fplMission: true },
    });

    if (!existingDocument) {
      console.log('[Tailboard API] Document not found:', id);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (existingDocument.createdById !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
      console.log('[Tailboard API] Unauthorized to update document:', id);
      return NextResponse.json({ error: 'Unauthorized to update this document' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = tailboardUpdateSchema.parse(body);

    if (validatedData.status && validatedData.status !== 'DRAFT') {
      if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
        console.log('[Tailboard API] Unauthorized to change document status:', id);
        return NextResponse.json({ error: 'Unauthorized to change document status' }, { status: 403 });
      }
    }

    const updatedDocument = await prisma.tailboardDocument.update({
      where: { id },
      data: {
        content: JSON.stringify(validatedData.content),
        date: new Date(validatedData.date),
        status: validatedData.status,
      },
    });

    console.log('[Tailboard API] Document updated successfully:', id);
    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Tailboard API] Validation error:', error.errors);
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[Tailboard API] Error updating tailboard document:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handleGet(req: NextRequest, session: { user: { id: string; role: string } }) {
  console.log('[Tailboard API] handleGet started');
  const { searchParams } = new URL(req.url);
  const fplMissionId = searchParams.get('fplMissionId');
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

  console.log('[Tailboard API] Query params:', { fplMissionId, status, startDate, endDate, page, limit });
  console.log('[Tailboard API] User role:', session.user.role);

  const where: WhereClause = {};

  // Apply role-based filters
  if (session.user.role === 'USER') {
    where.createdById = session.user.id;
    // For users, we might want to restrict which statuses they can view
    // For example, users might only see DRAFT and APPROVED documents
    where.status = { in: ['DRAFT', 'APPROVED'] };
  }

  if (fplMissionId) where.fplMissionId = fplMissionId;
  if (status && (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR')) {
    where.status = status as 'DRAFT' | 'PENDING' | 'APPROVED';
  }
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  console.log('[Tailboard API] Constructed where clause:', where);

  try {
    console.log('[Tailboard API] Attempting to fetch documents');
    const [documents, totalCount] = await Promise.all([
      prisma.tailboardDocument.findMany({
        where,
        include: {
          fplMission: true,
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tailboardDocument.count({ where }),
    ]);

    console.log(`[Tailboard API] Fetched ${documents.length} documents, total count: ${totalCount}`);

    return NextResponse.json({
      documents,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('[Tailboard API] Error fetching tailboard documents:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function handleGetSingle(req: NextRequest, session: { user: { id: string; role: string } }, id: string) {
  console.log('[Tailboard API] handleGetSingle called for id:', id);
  try {
    const document = await prisma.tailboardDocument.findUnique({
      where: { id },
      include: { fplMission: true },
    });

    if (!document) {
      console.log('[Tailboard API] Document not found:', id);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if the user has permission to view this document
    if (document.createdById !== session.user.id && session.user.role !== 'ADMIN' && session.user.role !== 'SUPERVISOR') {
      console.log('[Tailboard API] Unauthorized to view document:', id);
      return NextResponse.json({ error: 'Unauthorized to view this document' }, { status: 403 });
    }

    console.log('[Tailboard API] Document fetched successfully:', id);
    return NextResponse.json(document);
  } catch (error) {
    console.error('[Tailboard API] Error fetching tailboard document:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export const POST = rbacMiddleware(handler, ['ADMIN', 'SUPERVISOR', 'USER']);
export const PUT = rbacMiddleware(handler, ['ADMIN', 'SUPERVISOR', 'USER']);
export const GET = rbacMiddleware(handler, ['ADMIN', 'SUPERVISOR', 'USER']);
