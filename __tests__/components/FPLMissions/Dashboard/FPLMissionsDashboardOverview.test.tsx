import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FPLMissionsDashboardOverview } from '../../../../app/components/FPLMissions/Dashboard/FPLMissionsDashboardOverview';

// Mock the fetch function
global.fetch = jest.fn();

describe('FPLMissionsDashboardOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<FPLMissionsDashboardOverview />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders dashboard stats when fetch is successful', async () => {
    const mockStats = {
      totalDocuments: 10,
      statusCounts: {
        DRAFT: 3,
        PENDING: 4,
        APPROVED: 3,
      },
      recentDocuments: [
        { id: 'doc1', status: 'DRAFT', date: '2023-05-01', fplMission: { siteId: 'site1' } },
        { id: 'doc2', status: 'PENDING', date: '2023-05-02', fplMission: { siteId: 'site2' } },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<FPLMissionsDashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('Total Documents')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Draft Documents')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Pending Documents')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Approved Documents')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Recent Documents')).toBeInTheDocument();
      expect(screen.getByText('Site: site1')).toBeInTheDocument();
      expect(screen.getByText('Site: site2')).toBeInTheDocument();
    });
  });

  it('renders error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<FPLMissionsDashboardOverview />);

    await waitFor(() => {
      expect(screen.getByText('Error: Error fetching dashboard stats')).toBeInTheDocument();
    });
  });
});
