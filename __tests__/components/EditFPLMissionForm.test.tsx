import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditFPLMissionForm from '@/app/components/EditFPLMissionForm';
import { useRouter } from 'next/navigation';
import { useApi } from '@/app/hooks/useApi';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the useApi hook
jest.mock('@/app/hooks/useApi', () => ({
  useApi: jest.fn(),
}));

describe('EditFPLMissionForm', () => {
  const mockInitialMission = {
    id: '1',
    siteName: 'Test Site',
    status: 'DRAFT' as const,
    siteId: 'TEST001',
  };

  const mockRouter = {
    push: jest.fn(),
  };

  const mockFetchWithAuth = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useApi as jest.Mock).mockReturnValue({ fetchWithAuth: mockFetchWithAuth });
  });

  it('renders the form with initial mission data', () => {
    render(<EditFPLMissionForm initialMission={mockInitialMission} />);

    expect(screen.getByLabelText('Site Name')).toHaveValue('Test Site');
    expect(screen.getByLabelText('Site ID')).toHaveValue('TEST001');
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('updates mission data when form fields change', () => {
    render(<EditFPLMissionForm initialMission={mockInitialMission} />);

    fireEvent.change(screen.getByLabelText('Site Name'), { target: { value: 'Updated Site' } });
    fireEvent.change(screen.getByLabelText('Site ID'), { target: { value: 'UPDATED001' } });

    expect(screen.getByLabelText('Site Name')).toHaveValue('Updated Site');
    expect(screen.getByLabelText('Site ID')).toHaveValue('UPDATED001');
  });

  it('submits the form with updated data', async () => {
    mockFetchWithAuth.mockResolvedValue({});

    render(<EditFPLMissionForm initialMission={mockInitialMission} />);

    fireEvent.change(screen.getByLabelText('Site Name'), { target: { value: 'Updated Site' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        '/api/fpl-missions/1?type=fpl-mission',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            ...mockInitialMission,
            siteName: 'Updated Site',
          }),
        })
      );
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/fpl-missions');
  });

  it('displays an error message when form submission fails', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Submission failed'));

    render(<EditFPLMissionForm initialMission={mockInitialMission} />);

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update mission. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables form inputs and buttons while submitting', async () => {
    mockFetchWithAuth.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<EditFPLMissionForm initialMission={mockInitialMission} />);

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByLabelText('Site Name')).toBeDisabled();
    expect(screen.getByLabelText('Site ID')).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).not.toBeDisabled();
    });
  });
});
