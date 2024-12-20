'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../../../../components/ui/button';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { toast } from 'react-hot-toast';

interface TailboardDocument {
  id: string;
  date: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  fplMissionId: string;
  content: {
    pilotName: string;
    site: string;
    tailboardReview: string;
    preFlightBriefing: string;
    rulesReview: string;
    flightPlanReview: string;
    signature: string;
  };
}

interface ConfirmDialogState {
  isOpen: boolean;
  newStatus: 'DRAFT' | 'PENDING' | 'APPROVED';
}

export default function TailboardDocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [tailboardDoc, setTailboardDoc] = useState<TailboardDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!params.id) {
        console.error('No tailboard document ID found in URL');
        toast.error('Missing tailboard document ID. Please try again.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/fpl-missions/tailboard-document/${params.id}`, {
          headers: {
            'X-User-Info': JSON.stringify({ user: session?.user }),
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch tailboard document: ${response.statusText}`);
        }
        const data = await response.json();
        setTailboardDoc(data);
      } catch (error) {
        console.error('Error fetching tailboard document:', error);
        toast.error('Failed to fetch tailboard document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDocument();
    }
  }, [params.id, session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleStatusChange = (newStatus: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    setConfirmDialog({ isOpen: true, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmDialog || !params.id) return;
    const { newStatus } = confirmDialog;
    try {
      const response = await fetch(`/api/fpl-missions/tailboard-document/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify({ user: session?.user }),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update document status: ${response.statusText}`);
      }

      const updatedDocument = await response.json();
      setTailboardDoc(updatedDocument);
      toast.success(`Document status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update document status. Please try again.');
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleExportPDF = async () => {
    if (!params.id) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/fpl-missions/export-pdf?id=${params.id}`, {
        headers: {
          'X-User-Info': JSON.stringify({ user: session?.user }),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `tailboard-document-${params.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again later.');
    } finally {
      setExporting(false);
    }
  };

  if (status === 'loading' || loading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (!tailboardDoc) {
    return <div>Error: Tailboard document not found</div>;
  }

  const isAdminOrSupervisor = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tailboard Document Details</h1>
      <div className="space-y-4">
        <p><strong>Date:</strong> {new Date(tailboardDoc.date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {tailboardDoc.status}</p>
        <p><strong>FPL Mission ID:</strong> {tailboardDoc.fplMissionId}</p>
        <p><strong>Pilot Name:</strong> {tailboardDoc.content.pilotName}</p>
        <p><strong>Site:</strong> {tailboardDoc.content.site}</p>
        <h2 className="text-xl font-semibold mt-4">Tailboard Review</h2>
        <p>{tailboardDoc.content.tailboardReview}</p>
        <h2 className="text-xl font-semibold mt-4">Pre-Flight Briefing</h2>
        <p>{tailboardDoc.content.preFlightBriefing}</p>
        <h2 className="text-xl font-semibold mt-4">Rules Review</h2>
        <p>{tailboardDoc.content.rulesReview}</p>
        <h2 className="text-xl font-semibold mt-4">Flight Plan Review</h2>
        <p>{tailboardDoc.content.flightPlanReview}</p>
        <p><strong>Signature:</strong> {tailboardDoc.content.signature}</p>
      </div>
      <div className="mt-8 space-x-4">
        <Button onClick={() => router.push(`/dashboard/fpl-missions/tailboard/${params.id}/edit`)}>
          Edit
        </Button>
        <Button onClick={handleExportPDF} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export as PDF'}
        </Button>
        {isAdminOrSupervisor && (
          <>
            {tailboardDoc.status === 'PENDING' && (
              <Button onClick={() => handleStatusChange('APPROVED')}>Approve</Button>
            )}
            {tailboardDoc.status === 'DRAFT' && (
              <Button onClick={() => handleStatusChange('PENDING')}>Submit for Approval</Button>
            )}
            {tailboardDoc.status === 'APPROVED' && (
              <Button onClick={() => handleStatusChange('PENDING')}>Revoke Approval</Button>
            )}
          </>
        )}
      </div>
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Status Change</h3>
            <p>Are you sure you want to change the status of this document to {confirmDialog.newStatus}?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button onClick={confirmStatusChange}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
