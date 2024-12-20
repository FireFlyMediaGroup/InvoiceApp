import { NextResponse } from 'next/server';
import prisma from '../../../utils/db';
import { auth } from '../../../utils/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        total: true,
        currency: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 7,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
