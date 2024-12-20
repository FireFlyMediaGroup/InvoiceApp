import prisma from '../utils/db';
import { requireUser } from '../utils/hooks';

interface Invoice {
  id: string;
  total: number;
  status: 'PENDING' | 'PAID';
}

async function getData(userId: string): Promise<{
  data: Invoice[];
  openInvoices: Invoice[];
  paidinvoices: Invoice[];
}> {
  try {
    const [data, openInvoices, paidinvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          total: true,
          status: true,
        },
      }),
      prisma.invoice.findMany({
        where: {
          userId: userId,
          status: 'PENDING',
        },
        select: {
          id: true,
          total: true,
          status: true,
        },
      }),
      prisma.invoice.findMany({
        where: {
          userId: userId,
          status: 'PAID',
        },
        select: {
          id: true,
          total: true,
          status: true,
        },
      }),
    ]);

    return {
      data,
      openInvoices,
      paidinvoices,
    };
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return {
      data: [],
      openInvoices: [],
      paidinvoices: [],
    };
  }
}

export async function DashboardBlocksServer() {
  try {
    const session = await requireUser();
    const { data, openInvoices, paidinvoices } = await getData(
      session.user?.id as string
    );

    const totalRevenue = data.reduce((acc, invoice) => acc + invoice.total, 0);

    return { data, openInvoices, paidinvoices, totalRevenue };
  } catch (error) {
    console.error('Error in DashboardBlocksServer:', error);
    return {
      data: [],
      openInvoices: [],
      paidinvoices: [],
      totalRevenue: 0,
    };
  }
}
