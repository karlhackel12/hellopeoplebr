
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDeleteInvitation = (onUpdate: () => void) => {
  const [deletingInvitations, setDeletingInvitations] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteInvitation = useCallback(async (id: string, email: string) => {
    try {
      // Mark this invitation as being deleted
      setDeletingInvitations(prev => ({ ...prev, [id]: true }));
      setIsDeleting(true);
      
      console.log(`Attempting to delete invitation for ${email} with id ${id}`);
      
      // Perform the deletion operation
      const { error, count } = await supabase
        .from('student_invitations')
        .delete()
        .eq('id', id)
        .select('count');
      
      // Check if there was an error during deletion
      if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
      }
      
      // Verify if any rows were actually deleted
      if (count === 0) {
        console.warn(`No invitation found with id ${id}`);
        toast.warning('Invitation not found', {
          description: 'The invitation may have already been deleted.',
        });
      } else {
        console.log(`Successfully deleted invitation for ${email}`);
        toast.success('Invitation deleted', {
          description: `The invitation to ${email} has been removed.`,
        });
      }
      
      // Ensure the parent component refetches the updated data immediately
      onUpdate();
    } catch (error: any) {
      console.error('Failed to delete invitation:', error);
      toast.error('Failed to delete invitation', {
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      // Clear the deleting state
      setDeletingInvitations(prev => ({ ...prev, [id]: false }));
      setIsDeleting(false);
    }
  }, [onUpdate]);

  return {
    deletingInvitations,
    deleteInvitation,
    isDeleting
  };
};
