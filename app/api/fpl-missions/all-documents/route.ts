import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '../../../utils/db';
import { rbacMiddleware } from '../../../middleware/rbac';
import type { DocumentStatus } from '@prisma/client';
import { LRUCache } from 'lru-cache';
import { auth } from '../../../utils/auth';

interface SessionUser {
  id: string;
  role: string;
}

interface TailboardContent {
  site: string;
  [key: string]: unknown;
}

type DocumentType = 'fpl-mission' | 'tailboard' | 'risk-matrix' | 'mission-planning-script';

interface Document {
  id: string;
  status: DocumentStatus;
  site: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  documentType: DocumentType;
}

interface CacheEntry {
  data: Document[];
  timestamp: number;
}

const cache = new LRUCache<string, CacheEntry>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const RATE_LIMIT = 5; // requests per minute
const rateLimitMap = new Map<string, number[]>();

async function handleGET(request: NextRequest) {
  try {
    console.log('[All Documents GET] Received GET request for all documents');

    const session = await auth();
    if (!session || !session.user) {
      console.log('[All Documents GET] No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!user.id || !user.role) {
      console.log('[All Documents GET] Invalid user information in session');
      return NextResponse.json({ error: 'Invalid user information' }, { status: 400 });
    }

    const userId = user.id;
    const userRole = user.role;

    console.log(`[All Documents GET] User ID: ${userId}, Role: ${userRole}`);

    // Rate limiting
    const now = Date.now();
    const userRequests = rateLimitMap.get(userId) || [];
    const recentRequests = userRequests.filter(time => now - time < 60000);
    if (recentRequests.length >= RATE_LIMIT) {
      console.log(`[All Documents GET] Rate limit exceeded for user ${userId}`);
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    rateLimitMap.set(userId, [...recentRequests, now]);

    // Check cache
    const cacheKey = `${userId}-${userRole}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[All Documents GET] Returning cached data for user ${userId}`);
      return NextResponse.json({
        data: cachedData.data,
        timestamp: cachedData.timestamp,
        cached: true
      });
    }

    const whereClause = userRole === 'ADMIN' || userRole === 'SUPERVISOR' ? {} : { userId };

    const [fplMissions, tailboardDocuments, riskMatrices, missionPlanningScripts] = await Promise.all([
      prisma.fPLMission.findMany({
        where: whereClause,
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
      }),
      prisma.tailboardDocument.findMany({
        where: userRole === 'ADMIN' || userRole === 'SUPERVISOR' ? {} : { createdById: userId },
      }),
      prisma.riskMatrix.findMany({
        where: whereClause,
      }),
      prisma.missionPlanningScript.findMany({
        where: whereClause,
      }),
    ]);

    const allDocuments: Document[] = [
      ...fplMissions.map(mission => ({
        id: mission.id,
        status: mission.status,
        site: mission.document?.site || 'N/A',
        createdAt: mission.createdAt,
        updatedAt: mission.updatedAt,
        createdBy: mission.userId,
        documentType: 'fpl-mission' as DocumentType,
      })),
      ...tailboardDocuments.map(doc => ({
        id: doc.id,
        status: doc.status,
        site: (doc.content as TailboardContent).site || 'N/A',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        createdBy: doc.createdById,
        documentType: 'tailboard' as DocumentType,
      })),
      ...riskMatrices.map(matrix => ({
        id: matrix.id,
        status: matrix.status,
        site: matrix.site,
        createdAt: matrix.createdAt,
        updatedAt: matrix.updatedAt,
        createdBy: matrix.userId,
        documentType: 'risk-matrix' as DocumentType,
      })),
      ...missionPlanningScripts.map(script => ({
        id: script.id,
        status: script.status,
        site: script.site,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt,
        createdBy: script.userId,
        documentType: 'mission-planning-script' as DocumentType,
      })),
    ];

    console.log(`[All Documents GET] Retrieved ${allDocuments.length} documents`);

    const responseData: CacheEntry = {
      data: allDocuments,
      timestamp: Date.now(),
    };

    // Cache the result
    cache.set(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[All Documents GET] Error fetching all documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export const GET = rbacMiddleware(handleGET, ['USER', 'SUPERVISOR', 'ADMIN']);
