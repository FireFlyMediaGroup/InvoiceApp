import { NextResponse } from 'next/server';
import { auth } from '../../../utils/auth';
import prisma from '../../../utils/db';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawData = await prisma.invoice.findMany({
    where: {
      status: 'PAID',
      userId: session.user.id,
      createdAt: {
        lte: new Date(),
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const aggregatedData = rawData.reduce((acc: { [key: string]: number }, curr) => {
    const date = new Date(curr.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    acc[date] = (acc[date] || 0) + curr.total;
    return acc;
  }, {});

  const data = Object.entries(aggregatedData)
    .map(([date, amount]) => ({
      date,
      amount,
      originalDate: new Date(`${date}, ${new Date().getFullYear()}`),
    }))
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .map(({ date, amount }) => ({
      date,
      amount,
    }));

  return NextResponse.json(data);
}
