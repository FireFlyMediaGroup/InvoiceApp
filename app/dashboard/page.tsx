import { Suspense } from 'react';
import { DashboardBlocksContainer } from '../components/DashboardBlocksContainer';
import { DashboardBlocksServer } from '../components/DashboardBlocksServer';
import { EmptyState } from '../components/EmptyState';
import { InvoiceGraphWrapper } from '../components/InvoiceGraphWrapper';
import { RecentInvoicesWrapper } from '../components/RecentInvoicesWrapper';
import { AdminDashboardCards } from '../components/AdminDashboardCards';
import FPLMissionsDashboard from '../components/FPLMissionsDashboard';
import prisma from '../utils/db';
import { requireUser } from '../utils/hooks';
import type { User } from 'next-auth';

async function getData(userId: string, role: string) {
  try {
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
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return [];
  }
}

export default async function DashboardRoute() {
  const session = await requireUser();
  const user = session.user as User;
  const data = await getData(user.id as string, user.role as string);
  const dashboardData = await DashboardBlocksServer();

  const renderDashboardContent = () => {
    if (data.length < 1 || dashboardData.data.length < 1) {
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
      <div className="space-y-6">
        <Suspense fallback={<div>Loading dashboard blocks...</div>}>
          <DashboardBlocksContainer dashboardData={dashboardData} />
        </Suspense>
        <div className="grid gap-6 lg:grid-cols-3">
          <InvoiceGraphWrapper />
          <RecentInvoicesWrapper />
        </div>
      </div>
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
      <div className="mt-8">
        <FPLMissionsDashboard 
          userRole={user.role as 'USER' | 'SUPERVISOR' | 'ADMIN'} 
          userId={user.id as string}
        />
      </div>
    </div>
  );
}
