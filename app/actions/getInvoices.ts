import { requireUser } from '../utils/hooks';
import prisma from '../utils/db';
import type { Prisma } from '@prisma/client';

export type InvoiceData = Prisma.InvoiceGetPayload<{
  select: {
    id: true;
    clientName: true;
    total: true;
    createdAt: true;
    status: true;
    invoiceNumber: true;
    currency: true;
  };
}>;

export async function getInvoices(): Promise<InvoiceData[]> {
  const session = await requireUser();
  const userId = session.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      clientName: true,
      total: true,
      createdAt: true,
      status: true,
      invoiceNumber: true,
      currency: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return data;
}
