"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface TailboardDocument {
  id: string;
  date: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  fplMissionId: string;
  content: string;
}

interface PaginatedResponse {
  documents: TailboardDocument[];
  totalPages: number;
  currentPage: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  docId: string;
  newStatus: 'DRAFT' | 'PENDING' | 'APPROVED';
}

export function AdminTailboardList() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<TailboardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const isAdminOrSupervisor = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR';

  const fetchUrl = useMemo(() => {
    return `/api/fpl-missions/tailboard-document?page=${currentPage}&limit=10${searchTerm ? `&fplMissionId=${searchTerm}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`;
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching documents from:', fetchUrl);
        const response = await fetch(fetchUrl, {
          headers: {
            'X-User-Info': JSON.stringify({ user: session?.user }),
          },
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch tailboard documents: ${response.status} ${response.statusText}`);
        }
        const data: PaginatedResponse = await response.json();
        console.log('Fetched data:', data);
        setDocuments(data.documents);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error in fetchDocuments:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast.error('Failed to fetch tailboard documents');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDocuments();
    }
  }, [fetchUrl, session]);

  const handleStatusChange = async (id: string, newStatus: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    setConfirmDialog({ isOpen: true, docId: id, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmDialog) return;
    const { docId, newStatus } = confirmDialog;
    try {
      const response = await fetch(`/api/fpl-missions/tailboard-document/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify({ user: session?.user }),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document status');
      }

      const updatedDocument = await response.json();
      setDocuments(documents.map(doc => doc.id === docId ? updatedDocument : doc));
      toast.success(`Document status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update document status');
    } finally {
      setConfirmDialog(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <Skeleton className="w-full h-64" />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Tailboard Documents ({isAdminOrSupervisor ? 'Admin View' : 'User View'})
      </h2>
      <div className="mb-4 flex space-x-4">
        <Input
          placeholder="Search by FPL Mission ID"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        {isAdminOrSupervisor && (
          <div className="max-w-sm">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
            </Select>
          </div>
        )}
      </div>
      {documents.length === 0 ? (
        <p>No tailboard documents found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>FPL Mission ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.status}</TableCell>
                  <TableCell>{doc.fplMissionId}</TableCell>
                  <TableCell>
                    <div className="space-x-2">
                      <Link href={`/dashboard/fpl-missions/tailboard/${doc.id}`} passHref>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {(isAdminOrSupervisor || doc.status === 'DRAFT') && (
                        <Link href={`/dashboard/fpl-missions/tailboard/${doc.id}/edit`} passHref>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                      {isAdminOrSupervisor && doc.status === 'PENDING' && (
                        <Button onClick={() => handleStatusChange(doc.id, 'APPROVED')} variant="outline" size="sm">
                          Approve
                        </Button>
                      )}
                      {doc.status === 'DRAFT' && (
                        <Button onClick={() => handleStatusChange(doc.id, 'PENDING')} variant="outline" size="sm">
                          Submit
                        </Button>
                      )}
                      {isAdminOrSupervisor && doc.status === 'APPROVED' && (
                        <Button onClick={() => handleStatusChange(doc.id, 'PENDING')} variant="outline" size="sm">
                          Revoke Approval
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
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
