
import React, { useEffect } from 'react';
import { useInvitationManagement } from './hooks/useInvitationManagement';
import InvitationStatusBadge from '@/components/student/invitation/components/InvitationStatusBadge';
import InvitationExpiryTimer from '@/components/student/invitation/components/InvitationExpiryTimer';
import { Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface StudentInvitation {
  id: string;
  email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  created_at: string;
  expires_at: string;
}

interface InvitationsListProps {
  invitations: StudentInvitation[];
  loading: boolean;
  onUpdate: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ 
  invitations, 
  loading, 
  onUpdate 
}) => {
  const {
    processingInvitations,
    isProcessing,
    resendInvitation,
    deleteInvitation
  } = useInvitationManagement(onUpdate);

  useEffect(() => {
    onUpdate();
  }, [onUpdate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading invitations...</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <Alert>
        <AlertDescription>No invitations found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <Alert className="bg-muted animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>Processing your request...</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onUpdate}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-4 py-3">{invitation.email}</td>
                  <td className="px-4 py-3">
                    <InvitationStatusBadge status={invitation.status} />
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {invitation.invitation_code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <InvitationExpiryTimer expiresAt={invitation.expires_at} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendInvitation(
                          invitation.id,
                          invitation.email,
                          invitation.invitation_code
                        )}
                        disabled={processingInvitations[invitation.id]}
                      >
                        {processingInvitations[invitation.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Resend'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInvitation(invitation.id, invitation.email)}
                        disabled={processingInvitations[invitation.id]}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvitationsList;
