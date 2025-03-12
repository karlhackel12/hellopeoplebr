
import { useDeleteInvitation } from './hooks/useDeleteInvitation';
import { useResendInvitation } from './hooks/useResendInvitation';

export const useInvitationActions = (onUpdate: () => void) => {
  const { 
    deletingInvitations, 
    deleteInvitation, 
    isDeleting 
  } = useDeleteInvitation(onUpdate);
  
  const { 
    resendingInvitations, 
    resendInvitation, 
    isResending 
  } = useResendInvitation(onUpdate);

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
