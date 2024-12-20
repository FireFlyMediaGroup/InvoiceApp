"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
// TODO: Find the correct import for the Skeleton component
// import { Skeleton } from '...';

interface DashboardStats {
  totalDocuments: number;
  statusCounts: {
    DRAFT: number;
    PENDING: number;
    APPROVED: number;
  };
  recentDocuments: Array<{
    id: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED';
    date: string;
    fplMission: {
      siteId: string;
    };
  }>;
}

export function FPLMissionsDashboardOverview() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/fpl-missions/dashboard-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This is important for including the session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Error fetching dashboard stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [status]);

  if (loading) return <div className="w-full h-64 bg-gray-200 animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.statusCounts.DRAFT || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.statusCounts.PENDING || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.statusCounts.APPROVED || 0}</div>
        </CardContent>
      </Card>
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {stats.recentDocuments.map((doc) => (
              <li key={doc.id} className="flex justify-between items-center">
                <span>Site: {doc.fplMission.siteId}</span>
                <span>Date: {new Date(doc.date).toLocaleDateString()}</span>
                <span className="capitalize">Status: {doc.status.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
