import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FPLMissionStatus } from '@/app/utils/types';

interface StatusBadgeProps {
  status: FPLMissionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: FPLMissionStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-yellow-200 text-yellow-800';
      case 'PENDING':
        return 'bg-blue-200 text-blue-800';
      case 'APPROVED':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)}`}>
      {status}
    </Badge>
  );
}
