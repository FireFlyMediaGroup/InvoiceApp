import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminTailboardList } from '../../../../app/components/FPLMissions/List/AdminTailboardList';
import { toast } from 'react-hot-toast';

// Mock the fetch function
global.fetch = jest.fn();

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('AdminTailboardList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<AdminTailboardList />);
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

    render(<AdminTailboardList />);

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

    render(<AdminTailboardList />);

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

    render(<AdminTailboardList />);

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

    render(<AdminTailboardList />);

    await waitFor(() => {
      expect(screen.getByText('FPL001')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search by FPL Mission ID'), { target: { value: 'FPL001' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'DRAFT' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('fplMissionId=FPL001&status=DRAFT'));
    });
  });

  it('handles status change correctly', async () => {
    const mockDocuments = {
      documents: [{ id: '1', date: '2023-05-01', status: 'PENDING', fplMissionId: 'FPL001' }],
      totalPages: 1,
      currentPage: 1,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocuments,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockDocuments.documents[0], status: 'APPROVED' }),
      });

    render(<AdminTailboardList />);

    await waitFor(() => {
      expect(screen.getByText('FPL001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/fpl-missions/tailboard-document/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'APPROVED' }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Document status updated to APPROVED');
    });
  });
});
