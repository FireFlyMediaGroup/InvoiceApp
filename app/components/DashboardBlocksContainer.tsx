import { DashboardBlocksWrapper } from './DashboardBlocksWrapper';

interface Invoice {
  id: string;
  total: number;
  status: 'PENDING' | 'PAID';
}

interface DashboardData {
  data: Invoice[];
  openInvoices: Invoice[];
  paidinvoices: Invoice[];
  totalRevenue: number;
}

interface DashboardBlocksContainerProps {
  dashboardData: DashboardData;
}

export function DashboardBlocksContainer({ dashboardData }: DashboardBlocksContainerProps) {
  return <DashboardBlocksWrapper dashboardData={dashboardData} />;
}
