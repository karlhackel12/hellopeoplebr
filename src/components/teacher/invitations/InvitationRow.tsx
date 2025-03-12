
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrashIcon, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface StudentInvitation {
  id: string;
  email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  created_at: string;
  expires_at: string;
  user_id?: string | null;
  used_by_name?: string | null;
  accepted_at?: string | null;
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
  const [copied, setCopied] = React.useState(false);

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitation.invitation_code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Failed to copy code');
    }
  };

  // Check if it's a code-only invitation (no email)
  const isCodeOnly = !invitation.email || invitation.email.trim() === '';

  return (
    <tr>
      <td className="px-4 py-3">
        {isCodeOnly ? (
          <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800">Code Only</Badge>
        ) : (
          invitation.email
        )}
      </td>
      <td className="px-4 py-3">
        {getStatusBadge(invitation.status)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <code className="bg-muted px-2 py-1 rounded text-xs">
            {invitation.invitation_code}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyCode}
            title="Copy code"
            className="h-6 w-6"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-4 py-3 text-sm">
        {invitation.status === 'accepted' && invitation.accepted_at ? (
          <span className="text-green-700">
            {invitation.used_by_name || 'Student'} ({format(new Date(invitation.accepted_at), 'MMM dd, yyyy')})
          </span>
        ) : '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end space-x-2">
          {!isCodeOnly && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onResend(invitation.id, invitation.email, invitation.invitation_code)}
              disabled={isResending || invitation.status === 'accepted'}
              title="Resend invitation"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(invitation.id, invitation.email || 'this invitation')}
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
