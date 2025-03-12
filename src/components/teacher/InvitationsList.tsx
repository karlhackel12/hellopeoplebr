
import React from 'react';
import { StudentInvitation } from './invitations/InvitationRow';
import { useInvitationActions } from './invitations/useInvitationActions';
import InvitationsTable from './invitations/InvitationsTable';
import EmptyInvitations from './invitations/EmptyInvitations';
import LoadingInvitations from './invitations/LoadingInvitations';

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
        <div className="bg-muted p-3 rounded flex items-center justify-center space-x-2 mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processing your request...</span>
        </div>
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
