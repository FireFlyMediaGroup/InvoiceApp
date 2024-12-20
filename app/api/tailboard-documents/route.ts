import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { auth } from '../../utils/auth';

const tailboardContentSchema = z.object({
  pilotName: z.string(),
  site: z.string(),
  tailboardComplete: z.boolean(),
  tailboardReviewNotes: z.string(),
  preFlightBriefingComplete: z.boolean(),
  preFlightBriefingNotes: z.string(),
  rulesRegulationsReviewComplete: z.boolean(),
  rulesRegulationsReviewNotes: z.string(),
  flightPlanReviewComplete: z.boolean(),
  flightPlanReviewNotes: z.string(),
  signatureRPIC: z.string(),
  dateRPIC: z.string(),
  signatureFlightCrew1: z.string().optional(),
  dateFlightCrew1: z.string().optional(),
  signatureFlightCrew2: z.string().optional(),
  dateFlightCrew2: z.string().optional(),
  signatureFlightCrew3: z.string().optional(),
  dateFlightCrew3: z.string().optional(),
});

const tailboardSchema = z.object({
  date: z.string(),
  fplMissionId: z.string(),
  content: tailboardContentSchema,
});

export async function POST(req: NextRequest) {
  try {
    console.log('[Tailboard POST] Received POST request for tailboard document');

    const session = await auth();
    if (!session || !session.user) {
      console.log('[Tailboard POST] Unauthorized: No session or user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    console.log(`[Tailboard POST] User ID: ${userId}, Role: ${userRole}`);

    const body = await req.json();
    console.log('[Tailboard POST] Request body:', JSON.stringify(body, null, 2));

    const validatedData = tailboardSchema.parse(body);
    console.log('[Tailboard POST] Validated data:', JSON.stringify(validatedData, null, 2));

    // Check if the FPLMission exists, if not create it
    let fplMission = await prisma.fPLMission.findUnique({
      where: { id: validatedData.fplMissionId },
    });

    if (!fplMission) {
      console.log(`[Tailboard POST] FPLMission with ID ${validatedData.fplMissionId} not found. Creating new mission.`);
      fplMission = await prisma.fPLMission.create({
        data: {
          id: validatedData.fplMissionId,
          status: 'DRAFT',
          siteName: validatedData.content.site,
          siteId: validatedData.content.site,
          userId: userId,
        },
      });
      console.log('[Tailboard POST] New FPLMission created:', JSON.stringify(fplMission, null, 2));
    }

    console.log('[Tailboard POST] Attempting to create tailboard document in database');
    const tailboardDocument = await prisma.tailboardDocument.create({
      data: {
        date: new Date(validatedData.date),
        fplMissionId: fplMission.id,
        content: validatedData.content as Prisma.InputJsonValue,
        status: 'DRAFT',
        createdById: userId,
      },
    });

    console.log('[Tailboard POST] Tailboard document created successfully:', JSON.stringify(tailboardDocument, null, 2));
    return NextResponse.json(tailboardDocument, { status: 201 });
  } catch (error) {
    console.error('[Tailboard POST] Error creating tailboard document:', error);
    if (error instanceof z.ZodError) {
      console.error('[Tailboard POST] Validation error:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'A tailboard document for this FPL Mission already exists' }, { status: 400 });
      }
    }
    console.error('[Tailboard POST] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while creating the tailboard document' }, { status: 500 });
  }
}
