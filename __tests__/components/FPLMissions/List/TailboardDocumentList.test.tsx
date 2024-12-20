import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TailboardDocumentList } from '../../../../app/components/FPLMissions/List/TailboardDocumentList';

// Mock the fetch function
global.fetch = jest.fn();

describe('TailboardDocumentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TailboardDocumentList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the list of documents when fetch succeeds', async () => {
    const mockDocuments = {
      documents: [
        { id: '1', date: '2023-05-01', status: 'DRAFT', fplMissionId: 'FPL001' },
        { id: '2', date: '2023-05-02', status: 'PENDING', fplMissionId: 'FPL002' },
      ],
      totalPages: 1,
      currentPage: 1,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocuments,
    });

    render(<TailboardDocumentList />);

    await waitFor(() => {
      expect(screen.getByText('FPL001')).toBeInTheDocument();
      expect(screen.getByText('FPL002')).toBeInTheDocument();
    });
  });

  it('renders "No tailboard documents found" when the list is empty', async () => {
    const mockEmptyResponse = {
      documents: [],
      totalPages: 0,
      currentPage: 1,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEmptyResponse,
    });

    render(<TailboardDocumentList />);

    await waitFor(() => {
      expect(screen.getByText('No tailboard documents found.')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const mockDocumentsPage1 = {
      documents: [{ id: '1', date: '2023-05-01', status: 'DRAFT', fplMissionId: 'FPL001' }],
      totalPages: 2,
      currentPage: 1,
    };

    const mockDocumentsPage2 = {
      documents: [{ id: '2', date: '2023-05-02', status: 'PENDING', fplMissionId: 'FPL002' }],
      totalPages: 2,
      currentPage: 2,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocumentsPage1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocumentsPage2,
      });

    render(<TailboardDocumentList />);

    await waitFor(() => {
      expect(screen.getByText('FPL001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.getByText('FPL002')).toBeInTheDocument();
    });
  });

  it('handles search and filter correctly', async () => {
    const mockDocuments = {
      documents: [{ id: '1', date: '2023-05-01', status: 'DRAFT', fplMissionId: 'FPL001' }],
      totalPages: 1,
      currentPage: 1,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockDocuments,
    });

    render(<TailboardDocumentList />);

    await waitFor(() => {
      expect(screen.getByText('FPL001')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by FPL Mission ID'), { target: { value: 'FPL001' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DRAFT' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('fplMissionId=FPL001&status=DRAFT'));
    });
  });
});
