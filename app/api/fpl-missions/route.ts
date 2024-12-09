import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from 'app/utils/db';
import { auth } from 'app/utils/auth';
import { PrismaClient, Role, User } from '@prisma/client';
import { rbacMiddleware } from 'app/middleware/rbac';
import { logError } from 'app/utils/monitoring';

const createFPLMissionSchema = z.object({
  siteId: z.string(),
});

interface FPLMission {
  id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  siteId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

type PrismaClientWithFPLMission = PrismaClient & {
  fPLMission: {
    findMany: () => Promise<FPLMission[]>;
    create: (params: { data: Partial<FPLMission> }) => Promise<FPLMission>;
  };
};

interface UserWithRole extends Omit<User, 'role'> {
  role: Role;
  id: string;
}

export const GET = (request: NextRequest) =>
  rbacMiddleware(
    request,
    async (): Promise<NextResponse> => {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = session.user as UserWithRole;

      try {
        const fplMissions = await (prisma as PrismaClientWithFPLMission).fPLMission.findMany();
        const filteredMissions =
          user.role === 'USER' ? fplMissions.filter(m => m.userId === user.id) : fplMissions;

        return NextResponse.json(filteredMissions);
      } catch (error) {
        logError('Error fetching FPL missions', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    },
    ['USER', 'SUPERVISOR', 'ADMIN']
  );

export const POST = (request: NextRequest) =>
  rbacMiddleware(
    request,
    async (): Promise<NextResponse> => {
      const session = await auth();
      if (!session || !session.user || typeof session.user.id !== 'string') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const body = await request.json();
        const { siteId } = createFPLMissionSchema.parse(body);

        const newMission = await (prisma as PrismaClientWithFPLMission).fPLMission.create({
          data: {
            siteId,
            userId: session.user.id,
            status: 'DRAFT',
          },
        });

        return NextResponse.json(newMission);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        logError('Error creating FPL mission', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    },
    ['USER', 'SUPERVISOR', 'ADMIN']
  );
