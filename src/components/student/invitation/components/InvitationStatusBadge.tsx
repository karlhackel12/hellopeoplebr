
import React from 'react';
import { Badge } from '@/components/ui/badge';

type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'rejected';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

const InvitationStatusBadge: React.FC<InvitationStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { class: 'bg-yellow-100 border-yellow-200 text-yellow-800', label: 'Pending' },
    accepted: { class: 'bg-green-100 border-green-200 text-green-800', label: 'Accepted' },
    expired: { class: 'bg-gray-100 border-gray-200 text-gray-800', label: 'Expired' },
    rejected: { class: 'bg-red-100 border-red-200 text-red-800', label: 'Rejected' }
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.class}>
      {config.label}
    </Badge>
  );
};

export default InvitationStatusBadge;
