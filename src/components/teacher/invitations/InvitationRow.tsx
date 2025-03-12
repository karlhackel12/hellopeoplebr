
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrashIcon, Loader2 } from 'lucide-react';

export interface StudentInvitation {
  id: string;
  email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  created_at: string;
  expires_at: string;
}

interface InvitationRowProps {
  invitation: StudentInvitation;
  onResend: (id: string, email: string, invitationCode: string) => void;
  onDelete: (id: string, email: string) => void;
  isResending: boolean;
  isDeleting: boolean;
}

const InvitationRow: React.FC<InvitationRowProps> = ({
  invitation,
  onResend,
  onDelete,
  isResending,
  isDeleting
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-800">Expired</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <tr>
      <td className="px-4 py-3">{invitation.email}</td>
      <td className="px-4 py-3">
        {getStatusBadge(invitation.status)}
      </td>
      <td className="px-4 py-3">
        <code className="bg-muted px-2 py-1 rounded text-xs">
          {invitation.invitation_code}
        </code>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onResend(invitation.id, invitation.email, invitation.invitation_code)}
            disabled={isResending}
            title="Resend invitation"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(invitation.id, invitation.email)}
            disabled={isDeleting}
            title="Delete invitation"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default InvitationRow;
