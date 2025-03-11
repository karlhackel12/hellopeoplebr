
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface DeleteAssignmentButtonProps {
  assignmentId: string;
  onDelete: () => void;
}

const DeleteAssignmentButton: React.FC<DeleteAssignmentButtonProps> = ({ 
  assignmentId, 
  onDelete 
}) => {
  const deleteAssignment = async () => {
    try {
      const { error } = await supabase
        .from('student_assignments')
        .delete()
        .eq('id', assignmentId);
      
      if (error) throw error;
      
      toast.success('Assignment deleted', {
        description: 'The assignment has been successfully deleted',
      });
      
      onDelete();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment', {
        description: error.message,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Delete assignment"
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this assignment. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteAssignment}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAssignmentButton;
