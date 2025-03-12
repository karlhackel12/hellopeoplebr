
import React, { useEffect } from 'react';
import { StudentInvitation } from './invitations/InvitationRow';
import { useInvitationActions } from './invitations/useInvitationActions';
import InvitationsTable from './invitations/InvitationsTable';
import EmptyInvitations from './invitations/EmptyInvitations';
import LoadingInvitations from './invitations/LoadingInvitations';
import { Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
    console.log('InvitationsList mounted, fetching fresh data');
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
      
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            console.log('Manual refresh requested');
            onUpdate();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>
      
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
