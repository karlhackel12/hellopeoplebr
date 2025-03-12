
import { useDeleteInvitation } from './hooks/useDeleteInvitation';
import { useResendInvitation } from './hooks/useResendInvitation';

export const useInvitationActions = (onUpdate: () => void) => {
  // Force immediate cache invalidation and refetching when operations complete
  const forceUpdate = () => {
    console.log('Force updating invitations data');
    onUpdate();
  };
  
  const { 
    deletingInvitations, 
    deleteInvitation, 
    isDeleting 
  } = useDeleteInvitation(forceUpdate);
  
  const { 
    resendingInvitations, 
    resendInvitation, 
    isResending 
  } = useResendInvitation(forceUpdate);

  // Combined processing state
  const isProcessing = isDeleting || isResending;

  return {
    deletingInvitations,
    resendingInvitations,
    resendInvitation,
    deleteInvitation,
    isProcessing
  };
};
