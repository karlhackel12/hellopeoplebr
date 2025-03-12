
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteInvitation } from './hooks/useDeleteInvitation';
import { useResendInvitation } from './hooks/useResendInvitation';

export const useInvitationActions = (onUpdate: () => void) => {
  const queryClient = useQueryClient();
  
  // Create a more aggressive update function that ensures cache is refreshed
  const forceUpdate = () => {
    console.log('Force updating invitations data');
    
    // Invalidate the cache completely
    queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
    
    // Trigger an immediate update
    onUpdate();
    
    // Schedule additional updates to handle potential race conditions
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
      onUpdate();
    }, 300);
    
    // One final check after a longer delay
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['student-invitations'] });
      onUpdate();
    }, 1000);
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
