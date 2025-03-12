
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
    deleteInvitation
  } = useInvitationActions(onUpdate);

  if (loading) {
    return <LoadingInvitations />;
  }

  if (invitations.length === 0) {
    return <EmptyInvitations />;
  }

  return (
    <div className="space-y-4">
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
