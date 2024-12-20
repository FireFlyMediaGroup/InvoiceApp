import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MissionPlanningScriptForm } from '@/app/components/FPLMissions/Forms/MissionPlanningScriptForm';

describe('MissionPlanningScriptForm', () => {
  it('renders the form correctly', () => {
    const mockOnSubmit = jest.fn();
    render(<MissionPlanningScriptForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Mission Planning Script Content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Mission Planning Script/i })).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<MissionPlanningScriptForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Mission Planning Script Content/i), {
      target: { value: 'Test mission planning script content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Mission Planning Script/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: 'Test mission planning script content',
      });
    });
  });

  it('displays an error message for empty content', async () => {
    const mockOnSubmit = jest.fn();
    render(<MissionPlanningScriptForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Mission Planning Script/i }));

    await waitFor(() => {
      expect(screen.getByText(/Mission planning script content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
