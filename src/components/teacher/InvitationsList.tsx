
import React, { useEffect } from 'react';
import { StudentInvitation } from './invitations/InvitationRow';
import { useInvitationActions } from './invitations/useInvitationActions';
import InvitationsTable from './invitations/InvitationsTable';
import EmptyInvitations from './invitations/EmptyInvitations';
import LoadingInvitations from './invitations/LoadingInvitations';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    deletingInvitations,
    resendingInvitations,
    resendInvitation,
    deleteInvitation,
    isProcessing
  } = useInvitationActions(onUpdate);

  // Call onUpdate when component mounts to ensure data is fresh
  useEffect(() => {
    onUpdate();
  }, [onUpdate]);

  // Show loading state when initially loading or during batch operations
  if (loading) {
    return <LoadingInvitations />;
  }

  // Show empty state when there are no invitations
  if (invitations.length === 0) {
    return <EmptyInvitations />;
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <Alert className="bg-muted animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>
            Processing your request...
          </AlertDescription>
        </Alert>
      )}
      <InvitationsTable
        invitations={invitations}
        deletingInvitations={deletingInvitations}
        resendingInvitations={resendingInvitations}
        onResendInvitation={resendInvitation}
        onDeleteInvitation={deleteInvitation}
      />
    </div>
  );
};

export default InvitationsList;
