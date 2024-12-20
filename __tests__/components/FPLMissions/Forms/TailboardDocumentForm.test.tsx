import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TailboardDocumentForm } from '../../../../app/components/FPLMissions/Forms/TailboardDocumentForm';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('TailboardDocumentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all fields', () => {
    render(<TailboardDocumentForm onSubmit={mockOnSubmit} fplMissionId="FPL001" />);

    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pilot Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Site/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tailboard Review/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Pre-Flight Briefing/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rules Review/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Flight Plan Review/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Signature/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Tailboard Document/i })).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<TailboardDocumentForm onSubmit={mockOnSubmit} fplMissionId="FPL001" />);

    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2023-05-01' } });
    fireEvent.change(screen.getByPlaceholderText(/Pilot Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Site/i), { target: { value: 'Site A' } });
    fireEvent.change(screen.getByPlaceholderText(/Tailboard Review/i), { target: { value: 'Tailboard review content' } });
    fireEvent.change(screen.getByPlaceholderText(/Pre-Flight Briefing/i), { target: { value: 'Pre-flight briefing content' } });
    fireEvent.change(screen.getByPlaceholderText(/Rules Review/i), { target: { value: 'Rules review content' } });
    fireEvent.change(screen.getByPlaceholderText(/Flight Plan Review/i), { target: { value: 'Flight plan review content' } });
    fireEvent.change(screen.getByPlaceholderText(/Signature/i), { target: { value: 'John Doe' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Tailboard Document/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        date: '2023-05-01',
        pilotName: 'John Doe',
        site: 'Site A',
        tailboardReview: 'Tailboard review content',
        preFlightBriefing: 'Pre-flight briefing content',
        rulesReview: 'Rules review content',
        flightPlanReview: 'Flight plan review content',
        signature: 'John Doe',
        fplMissionId: 'FPL001',
      }));
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<TailboardDocumentForm onSubmit={mockOnSubmit} fplMissionId="FPL001" />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Tailboard Document/i }));

    await waitFor(() => {
      expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Pilot name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Site is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Tailboard review is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Pre-flight briefing is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Rules review is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Flight plan review is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Signature is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
