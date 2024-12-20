'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import { Badge } from "components/ui/badge";
import { Checkbox } from "components/ui/checkbox";
import { Plus, MoreHorizontal, Edit, Eye, Download, Check, Trash2, RefreshCw, Loader2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Input } from "components/ui/input";
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "components/ui/dialog";
import { useApi } from "app/hooks/useApi";
import { useSession } from "next-auth/react";
import { TailboardDocumentForm } from "./FPLMissions/Forms/TailboardDocumentForm";
import { RiskMatrixForm } from "./FPLMissions/Forms/RiskMatrixForm";
import { MissionPlanningScriptForm } from "./FPLMissions/Forms/MissionPlanningScriptForm";
import { useToast } from "app/components/ui/use-toast";

type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED';
type DocumentType = 'fpl-mission' | 'tailboard' | 'risk-matrix' | 'mission-planning-script';

interface Document {
  id: string;
  status: DocumentStatus;
  site: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  documentType: DocumentType;
}

const FPLMissionsDashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'status', desc: false }]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isCreateTailboardOpen, setIsCreateTailboardOpen] = useState(false);
  const [isCreateRiskMatrixOpen, setIsCreateRiskMatrixOpen] = useState(false);
  const [isCreateMissionPlanningScriptOpen, setIsCreateMissionPlanningScriptOpen] = useState(false);
  const [newFplMissionId, setNewFplMissionId] = useState<string>('');
  const [isSubmittingRiskMatrix, setIsSubmittingRiskMatrix] = useState(false);
  const router = useRouter();
  const { fetchWithAuth } = useApi();
  const { data: session, status } = useSession();
  const { showToast, ToastComponent } = useToast();

  const fetchDocuments = useCallback(async (retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/api/fpl-missions/all-documents');
      console.log('Fetched documents:', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error instanceof Error && error.name === 'RateLimitError') {
        showToast({
          message: 'Error: Rate limit exceeded. Please try again in a few minutes.',
          type: "error",
        });
        if (retryCount < 3) {
          setTimeout(() => fetchDocuments(retryCount + 1), 5000);
        }
      } else {
        showToast({
          message: 'Failed to fetch documents. Please try again.',
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchWithAuth, showToast]);

  useEffect(() => {
    console.log('Session status:', status);
    if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [fetchDocuments, status]);

  const handleRefresh = useCallback(() => {
    if (status === 'authenticated') {
      setIsRefreshing(true);
      fetchDocuments();
    }
  }, [fetchDocuments, status]);

  const handleEdit = useCallback((document: Document) => {
    if (status === 'authenticated') {
      router.push(`/dashboard/fpl-missions/${document.id}/edit?type=${document.documentType}`);
    }
  }, [router, status]);

  const handleView = useCallback((id: string, documentType: DocumentType) => {
    if (status === 'authenticated') {
      router.push(`/dashboard/fpl-missions/${id}/view?type=${documentType}`);
    }
  }, [router, status]);

  const handleDownload = useCallback(async (id: string, documentType: DocumentType) => {
    if (status !== 'authenticated') return;
    try {
      const response = await fetchWithAuth(`/api/fpl-missions/${id}?type=${documentType}`);
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${documentType}-${id}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast({
        message: 'Error: Failed to download document. Please try again.',
        type: "error",
      });
    }
  }, [fetchWithAuth, status, showToast]);

  const handleApprove = useCallback(async (ids: string[]) => {
    if (status !== 'authenticated') return;
    try {
      await Promise.all(ids.map(id => 
        fetchWithAuth(`/api/fpl-missions/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'APPROVED' }),
        })
      ));
      fetchDocuments();
      setSelectedDocuments([]);
      showToast({
        message: `Success: ${ids.length} document(s) approved successfully.`,
        type: "success",
      });
    } catch (error) {
      showToast({
        message: 'Failed to approve documents. Please try again.',
        type: "error",
      });
    }
  }, [fetchWithAuth, fetchDocuments, status, showToast]);

  const handleDelete = useCallback((document: Document) => {
    if (status === 'authenticated') {
      setDocumentToDelete(document.id);
      setDeleteConfirmOpen(true);
    }
  }, [status]);

  const confirmDelete = useCallback(async () => {
    if (!documentToDelete || status !== 'authenticated') return;
    try {
      const documentToDeleteObj = documents.find(doc => doc.id === documentToDelete);
      if (!documentToDeleteObj) throw new Error('Document not found');
      
      await fetchWithAuth(`/api/fpl-missions/${documentToDelete}?type=${documentToDeleteObj.documentType}`, {
        method: 'DELETE',
      });
      fetchDocuments();
      showToast({
        message: 'Success: Document deleted successfully.',
        type: "success",
      });
    } catch (error) {
      showToast({
        message: 'Failed to delete document. Please try again.',
        type: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  }, [documentToDelete, documents, fetchWithAuth, fetchDocuments, status, showToast]);

  const handleCreateTailboard = useCallback(() => {
    setNewFplMissionId('');
    setIsCreateTailboardOpen(true);
  }, []);

  const handleCreateRiskMatrix = useCallback(() => {
    setNewFplMissionId('');
    setIsCreateRiskMatrixOpen(true);
  }, []);

  const handleCreateMissionPlanningScript = useCallback(() => {
    setNewFplMissionId('');
    setIsCreateMissionPlanningScriptOpen(true);
  }, []);

  const handleFormSuccess = useCallback(async (formType: string) => {
    if (formType === 'tailboard') {
      setIsCreateTailboardOpen(false);
    } else if (formType === 'riskMatrix') {
      setIsCreateRiskMatrixOpen(false);
    } else if (formType === 'missionPlanningScript') {
      setIsCreateMissionPlanningScriptOpen(false);
    }
    await fetchDocuments();
  }, [fetchDocuments]);

  const columns = useMemo<ColumnDef<Document>[]>(() => {
    const getStatusBadgeVariant = (status: DocumentStatus) => {
      switch (status) {
        case 'APPROVED':
          return 'default';
        case 'PENDING':
          return 'secondary';
        case 'DRAFT':
          return 'outline';
        default:
          return 'default';
      }
    };

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'site',
        header: 'Site',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as DocumentStatus;
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'documentType',
        header: 'Document',
      },
      {
        accessorKey: 'createdBy',
        header: 'RPIC',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(row.original.id, row.original.documentType)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              {(session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'ADMIN' || (session?.user?.role === 'USER' && row.original.status === 'DRAFT' && row.original.createdBy === session?.user?.id)) && (
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleDownload(row.original.id, row.original.documentType)}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              {(session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'ADMIN' || (session?.user?.role === 'USER' && row.original.status === 'DRAFT' && row.original.createdBy === session?.user?.id)) && (
                <DropdownMenuItem onClick={() => handleDelete(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, [session, handleView, handleEdit, handleDownload, handleDelete]);

  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
  });

  console.log('Rendering FPLMissionsDashboard');
  console.log('isLoading:', isLoading);
  console.log('status:', status);
  console.log('documents:', documents);

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>FPL Missions</CardTitle>
          <CardDescription>Manage your FPL mission documents here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Input
              placeholder="Search documents..."
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-sm"
            />
            <div className="space-x-2">
              <Button onClick={handleCreateTailboard}>
                <Plus className="mr-2 h-4 w-4" /> New Tailboard
              </Button>
              <Button onClick={handleCreateRiskMatrix}>
                <Plus className="mr-2 h-4 w-4" /> New Risk Matrix
              </Button>
              <Button onClick={handleCreateMissionPlanningScript}>
                <Plus className="mr-2 h-4 w-4" /> New Mission Planning Script
              </Button>
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {selectedDocuments.length > 0 && (
                <Button onClick={() => setApproveConfirmOpen(true)}>
                  <Check className="mr-2 h-4 w-4" /> Approve Selected
                </Button>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateTailboardOpen} onOpenChange={setIsCreateTailboardOpen}>
        <DialogContent className="max-w-[95vw] w-full p-0 overflow-hidden">
          <DialogHeader className="p-6">
            <DialogTitle>Create New Tailboard Document</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0 pb-8">
            <div className="aspect-w-16 aspect-h-9 w-full">
              <TailboardDocumentForm 
                fplMissionId={newFplMissionId}
                onSubmit={() => handleFormSuccess('tailboard')}
                userId={session?.user?.id || ''}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateRiskMatrixOpen} onOpenChange={setIsCreateRiskMatrixOpen}>
        <DialogContent className="max-w-[95vw] w-full p-0 overflow-hidden">
          <DialogHeader className="p-6">
            <DialogTitle>Create New Risk Matrix</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0 pb-8">
            <div className="aspect-w-16 aspect-h-9 w-full">
              <RiskMatrixForm 
                initialData={undefined}
                onSubmit={async (data, isDraft) => {
                  setIsSubmittingRiskMatrix(true);
                  try {
                    console.log('Risk Matrix Data:', data);
                    console.log('Is Draft:', isDraft);
                    await handleFormSuccess('riskMatrix');
                    showToast({
                      message: `Success: Risk matrix ${isDraft ? 'saved as draft' : 'submitted for approval'}.`,
                      type: "success",
                    });
                  } catch (error) {
                    console.error('Error submitting risk matrix:', error);
                    showToast({
                      message: "Error: Failed to submit risk matrix. Please try again.",
                      type: "error",
                    });
                  } finally {
                    setIsSubmittingRiskMatrix(false);
                  }
                }}
                userId={session?.user?.id || ''}
              />
            </div>
          </div>
          {isSubmittingRiskMatrix && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateMissionPlanningScriptOpen} onOpenChange={setIsCreateMissionPlanningScriptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mission Planning Script</DialogTitle>
          </DialogHeader>
          <MissionPlanningScriptForm 
            fplMissionId={newFplMissionId}
            onSuccess={() => handleFormSuccess('missionPlanningScript')}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this document?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Selected Documents</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedDocuments.length} selected document(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleApprove(selectedDocuments);
              setApproveConfirmOpen(false);
            }}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ToastComponent}
    </div>
  );
};

export default FPLMissionsDashboard;
