import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RiskMatrixForm } from '@/app/components/FPLMissions/Forms/RiskMatrixForm';

describe('RiskMatrixForm', () => {
  it('renders the form correctly', () => {
    const mockOnSubmit = jest.fn();
    render(<RiskMatrixForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Risk Matrix Content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Risk Matrix/i })).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<RiskMatrixForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Risk Matrix Content/i), {
      target: { value: 'Test risk matrix content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Risk Matrix/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: 'Test risk matrix content',
      });
    });
  });

  it('displays an error message for empty content', async () => {
    const mockOnSubmit = jest.fn();
    render(<RiskMatrixForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Risk Matrix/i }));

    await waitFor(() => {
      expect(screen.getByText(/Risk matrix content is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
