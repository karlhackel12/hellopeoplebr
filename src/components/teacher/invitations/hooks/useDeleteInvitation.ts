
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
      
      console.log(`Deleting invitation for ${email} with id ${id}`);
      
      const { error } = await supabase
        .from('student_invitations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
      }
      
      console.log('Invitation deleted successfully');
      toast.success('Invitation deleted', {
        description: `The invitation to ${email} has been deleted`,
      });
      
      // Ensure the parent component refetches the updated data immediately
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error('Failed to delete invitation', {
        description: error.message,
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
