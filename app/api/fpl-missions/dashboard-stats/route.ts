import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/app/utils/db';
import { auth } from '@/app/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalDocuments, statusCounts, recentDocuments] = await Promise.all([
      prisma.tailboardDocument.count(),
      prisma.tailboardDocument.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.tailboardDocument.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { fplMission: true },
      }),
    ]);

    const statusCountsObject = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalDocuments,
      statusCounts: statusCountsObject,
      recentDocuments,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
