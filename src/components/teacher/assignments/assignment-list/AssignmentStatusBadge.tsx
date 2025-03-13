
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle } from 'lucide-react';

interface AssignmentStatusBadgeProps {
  status: string;
}

const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'not_started':
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Not Started</span>
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <PlayCircle className="h-3 w-3" />
          <span>In Progress</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Completed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">{status}</Badge>
      );
  }
};

export default AssignmentStatusBadge;
