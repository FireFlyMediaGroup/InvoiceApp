"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface TailboardDocument {
  id: string;
  date: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  fplMissionId: string;
}

interface PaginatedResponse {
  documents: TailboardDocument[];
  totalPages: number;
  currentPage: number;
}

export function TailboardDocumentList() {
  const [documents, setDocuments] = useState<TailboardDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/fpl-missions/tailboard-document?page=${currentPage}&limit=10${searchTerm ? `&fplMissionId=${searchTerm}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tailboard documents');
        }
        const data: PaginatedResponse = await response.json();
        setDocuments(data.documents);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError('Error fetching tailboard documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, searchTerm, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) return <Skeleton className="w-full h-64" />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tailboard Documents</h2>
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
                    <Link href={`/dashboard/fpl-missions/tailboard/${doc.id}`} passHref>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
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
      <div className="mt-4">
        <Link href="/dashboard/fpl-missions/tailboard/new" passHref>
          <Button>Create New Tailboard Document</Button>
        </Link>
      </div>
    </div>
  );
}
