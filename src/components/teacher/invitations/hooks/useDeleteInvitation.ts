
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useInvitationAction } from './useInvitationAction';

export const useDeleteInvitation = (onUpdate: () => void) => {
  const { 
    processingInvitations: deletingInvitations, 
    isProcessing: isDeleting,
    startProcessing,
    stopProcessing,
    handleError
  } = useInvitationAction(onUpdate);

  const deleteInvitation = useCallback(async (id: string, email: string) => {
    try {
      // Mark this invitation as being deleted
      startProcessing(id);
      
      console.log(`Attempting to delete invitation for ${email} with id ${id}`);
      
      // Direct deletion without pre-checking - simpler and more reliable
      const { data, error } = await supabase
        .from('student_invitations')
        .delete()
        .eq('id', id)
        .select();
      
      // Log the complete response for debugging
      console.log('Delete invitation response:', { data, error });
      
      // Check if there was an error during deletion
      if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
      }
      
      // Verify if any rows were actually deleted by checking the returned data
      if (!data || data.length === 0) {
        console.warn(`No invitation found with id ${id} or deletion failed`);
        toast.warning('Invitation not found', {
          description: 'The invitation may have already been deleted or you may not have permission to delete it.',
        });
      } else {
        console.log(`Successfully deleted invitation for ${email}`, data);
        toast.success('Invitation deleted', {
          description: `The invitation to ${email} has been removed.`,
        });
      }
      
      // After deletion, verify that it was actually removed from the database
      const { data: verifyData, error: verifyError } = await supabase
        .from('student_invitations')
        .select('id')
        .eq('id', id);
        
      if (verifyError) {
        console.error('Error verifying deletion:', verifyError);
      } else if (verifyData && verifyData.length > 0) {
        console.error('Deletion verification failed - invitation still exists in database:', verifyData);
        toast.error('Deletion may have failed', {
          description: 'The system reported success but the invitation still exists. Please try again.',
        });
      } else {
        console.log('Deletion verification successful - invitation no longer exists in database');
      }
    } catch (error: any) {
      handleError(error, 'delete invitation');
    } finally {
      // Clear the deleting state
      stopProcessing(id);
    }
  }, [startProcessing, stopProcessing, handleError]);

  return {
    deletingInvitations,
    deleteInvitation,
    isDeleting
  };
};

