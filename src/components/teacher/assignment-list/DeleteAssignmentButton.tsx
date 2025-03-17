
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
      
      toast.success('Tarefa excluída', {
        description: 'A tarefa foi excluída com sucesso',
      });
      
      onDelete();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error('Falha ao excluir a tarefa', {
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
          title="Excluir tarefa"
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
          <AlertDialogDescription>
            Isso excluirá permanentemente esta tarefa. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={deleteAssignment}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAssignmentButton;
