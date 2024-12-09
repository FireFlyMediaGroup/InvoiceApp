import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FPLMissionsList } from '@/app/components/FPLMissions/List/FPLMissionsList';
import { FPLMission } from '@/app/utils/types';

// Mock the useSession hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { role: 'USER' } },
    status: 'authenticated',
  })),
}));

describe('FPLMissionsList', () => {
  const mockMissions: FPLMission[] = [
    {
      id: '1',
      siteId: 'SITE001',
      status: 'DRAFT',
      userId: 'user1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      siteId: 'SITE002',
      status: 'PENDING',
      userId: 'user2',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  it('renders the list of missions', () => {
    render(<FPLMissionsList missions={mockMissions} />);
    
    expect(screen.getByText('FPL Missions')).toBeInTheDocument();
    expect(screen.getByText('SITE001')).toBeInTheDocument();
    expect(screen.getByText('SITE002')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders view buttons for all missions', () => {
    render(<FPLMissionsList missions={mockMissions} />);
    
    const viewButtons = screen.getAllByText('View');
    expect(viewButtons).toHaveLength(2);
  });

  it('does not render approve buttons for USER role', () => {
    render(<FPLMissionsList missions={mockMissions} />);
    
    const approveButtons = screen.queryAllByText('Approve');
    expect(approveButtons).toHaveLength(0);
  });

  // Add more tests as needed, e.g., testing SUPERVISOR/ADMIN roles, empty list, etc.
});
