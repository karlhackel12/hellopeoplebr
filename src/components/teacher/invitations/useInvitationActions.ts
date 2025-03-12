
import { useDeleteInvitation } from './hooks/useDeleteInvitation';
import { useResendInvitation } from './hooks/useResendInvitation';

export const useInvitationActions = (onUpdate: () => void) => {
  // Create a more aggressive update function that ensures cache is refreshed
  const forceUpdate = () => {
    console.log('Force updating invitations data');
    // Trigger an immediate update
    onUpdate();
    
    // Schedule another update after a small delay to ensure data is refreshed
    // This helps with potential race conditions in the database
    setTimeout(() => {
      onUpdate();
    }, 300);
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
