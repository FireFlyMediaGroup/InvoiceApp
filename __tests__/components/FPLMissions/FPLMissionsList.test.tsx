import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FPLMissionsList } from '@/app/components/FPLMissions/List/FPLMissionsList';
import { getFPLMissions, createFPLMission } from '@/app/actions/fplMissions';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

jest.mock('@/app/actions/fplMissions', () => ({
  getFPLMissions: jest.fn(),
  createFPLMission: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('FPLMissionsList', () => {
  const mockMissions = [
    { id: '1', siteId: 'SITE001', status: 'DRAFT', createdAt: new Date('2023-01-01').toISOString() },
    { id: '2', siteId: 'SITE002', status: 'PENDING', createdAt: new Date('2023-01-02').toISOString() },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders loading state initially', () => {
    (getFPLMissions as jest.Mock).mockReturnValue(new Promise(() => {}));
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' });
    render(<FPLMissionsList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders missions after loading for USER role', async () => {
    (getFPLMissions as jest.Mock).mockResolvedValue(mockMissions);
    (useSession as jest.Mock).mockReturnValue({ data: { user: { role: 'USER' } }, status: 'authenticated' });
    render(<FPLMissionsList />);

    await waitFor(() => {
      expect(screen.getByText('SITE001')).toBeInTheDocument();
      expect(screen.getByText('SITE002')).toBeInTheDocument();
      expect(screen.getByText('Create New Mission')).toBeInTheDocument();
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    });
  });

  it('renders missions after loading for ADMIN role', async () => {
    (getFPLMissions as jest.Mock).mockResolvedValue(mockMissions);
    (useSession as jest.Mock).mockReturnValue({ data: { user: { role: 'ADMIN' } }, status: 'authenticated' });
    render(<FPLMissionsList />);

    await waitFor(() => {
      expect(screen.getByText('SITE001')).toBeInTheDocument();
      expect(screen.getByText('SITE002')).toBeInTheDocument();
      expect(screen.getByText('Create New Mission')).toBeInTheDocument();
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to fetch missions';
    (getFPLMissions as jest.Mock).mockRejectedValue(new Error(errorMessage));
    (useSession as jest.Mock).mockReturnValue({ data: { user: { role: 'USER' } }, status: 'authenticated' });
    render(<FPLMissionsList />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith(`Failed to fetch missions: ${errorMessage}`);
    });
  });

  it('creates a new mission', async () => {
    const newMission = { id: '3', siteId: 'New Site', status: 'DRAFT', createdAt: new Date().toISOString() };
    (getFPLMissions as jest.Mock).mockResolvedValue(mockMissions);
    (createFPLMission as jest.Mock).mockResolvedValue(newMission);
    (useSession as jest.Mock).mockReturnValue({ data: { user: { role: 'USER' } }, status: 'authenticated' });

    render(<FPLMissionsList />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create New Mission'));
    });

    await waitFor(() => {
      expect(createFPLMission).toHaveBeenCalledWith({ siteId: 'New Site', status: 'DRAFT' });
      expect(screen.getByText('New Site')).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith('New mission created successfully');
    });
  });

  it('handles error when creating a new mission', async () => {
    const errorMessage = 'Failed to create mission';
    (getFPLMissions as jest.Mock).mockResolvedValue(mockMissions);
    (createFPLMission as jest.Mock).mockRejectedValue(new Error(errorMessage));
    (useSession as jest.Mock).mockReturnValue({ data: { user: { role: 'USER' } }, status: 'authenticated' });

    render(<FPLMissionsList />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Create New Mission'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Failed to create new mission: ${errorMessage}`);
    });
  });
});
