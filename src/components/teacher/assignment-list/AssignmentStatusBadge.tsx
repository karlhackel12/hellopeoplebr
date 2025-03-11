
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AssignmentStatusBadgeProps {
  status: string;
}

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'not_started':
      return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-800">Not Started</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Completed</Badge>;
    case 'late':
      return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Late</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default AssignmentStatusBadge;
