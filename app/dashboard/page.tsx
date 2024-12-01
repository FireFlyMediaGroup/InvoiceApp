import { Skeleton } from '../../components/ui/skeleton';
import { Suspense } from 'react';
import { DashboardBlocks } from '../components/DashboardBlocks';
import { EmptyState } from '../components/EmptyState';
import { InvoiceGraph } from '../components/InvoiceGraph';
import { RecentInvoices } from '../components/RecentInvoices';
import { AdminDashboardCards } from '../components/AdminDashboardCards';
import prisma from '../utils/db';
import { requireUser } from '../utils/hooks';
import type { ExtendedUser } from '../utils/auth';

async function getData(userId: string, role: string) {
  let data: { id: string; userId: string | null }[];
  if (role === 'ADMIN' || role === 'SUPERVISOR') {
    data = await prisma.invoice.findMany({
      select: {
        id: true,
        userId: true,
      },
    });
  } else {
    data = await prisma.invoice.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }
  return data;
}

export default async function DashboardRoute() {
  const session = await requireUser();
  const user = session.user as ExtendedUser;
  const data = await getData(user.id as string, user.role as string);

  const renderDashboardContent = () => {
    if (data.length < 1) {
      return (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to see it right here"
          buttontext="Create Invoice"
          href="/dashboard/invoices/create"
        />
      );
    }

    return (
      <Suspense fallback={<Skeleton className="w-full h-full flex-1" />}>
        <div className="space-y-6">
          <DashboardBlocks />
          <div className="grid gap-6 lg:grid-cols-3">
            <InvoiceGraph />
            <RecentInvoices />
          </div>
        </div>
      </Suspense>
    );
  };

  const renderAdminContent = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <AdminDashboardCards />
        {renderDashboardContent()}
      </div>
    );
  };

  const renderSupervisorContent = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Supervisor Dashboard</h2>
        {renderDashboardContent()}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {user.role === 'ADMIN' && renderAdminContent()}
      {user.role === 'SUPERVISOR' && renderSupervisorContent()}
      {user.role === 'USER' && renderDashboardContent()}
    </div>
  );
}
