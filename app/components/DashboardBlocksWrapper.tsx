"use client";

import React from 'react';
import { DashboardBlocks } from './DashboardBlocks';

// Define the structure of an invoice
interface Invoice {
  id: string;
  total: number;
  status: 'PENDING' | 'PAID';
}

// Define the structure of the dashboard data
interface DashboardData {
  data: Invoice[];
  openInvoices: Invoice[];
  paidinvoices: Invoice[];
  totalRevenue: number;
}

interface DashboardBlocksWrapperProps {
  dashboardData: DashboardData;
}

export function DashboardBlocksWrapper({ dashboardData }: DashboardBlocksWrapperProps) {
  const { data, openInvoices, paidinvoices, totalRevenue } = dashboardData;

  return (
    <DashboardBlocks
      data={data}
      openInvoices={openInvoices}
      paidinvoices={paidinvoices}
      totalRevenue={totalRevenue}
    />
  );
}
