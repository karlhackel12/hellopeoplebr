
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
      
      // First verify the invitation exists
      const { data: checkData, error: checkError } = await supabase
        .from('student_invitations')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.warn(`Error checking invitation existence: ${checkError.message}`);
        // If the error is "No rows returned", then invitation doesn't exist
        if (checkError.code === 'PGRST116') {
          toast.warning('Invitation not found', {
            description: 'The invitation may have already been deleted.',
          });
          return;
        }
      }
      
      // Perform the deletion operation without using count aggregate
      const { data, error } = await supabase
        .from('student_invitations')
        .delete()
        .eq('id', id)
        .select();
      
      // Check if there was an error during deletion
      if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
      }
      
      // Verify if any rows were actually deleted by checking the returned data
      if (!data || data.length === 0) {
        console.warn(`No invitation found with id ${id}`);
        toast.warning('Invitation not found', {
          description: 'The invitation may have already been deleted.',
        });
      } else {
        console.log(`Successfully deleted invitation for ${email}, received response:`, data);
        toast.success('Invitation deleted', {
          description: `The invitation to ${email} has been removed.`,
        });
      }
      
      // Force immediate data refresh
      setTimeout(() => {
        onUpdate();
      }, 100);
      
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
