
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAssignmentData = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['student-lesson-assignment', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching assignment data for lesson:', lessonId);
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, status, title, description, due_date')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log('Assignment data:', data);
      return data;
    },
    enabled: !!lessonId
  });

  const updateAssignmentStatus = useMutation({
    mutationFn: async ({ assignmentId, status, completed }: { assignmentId: string, status: string, completed: boolean }) => {
      console.log('Updating assignment status:', { assignmentId, status, completed });
      
      try {
        const { error } = await supabase
          .from('student_assignments')
          .update({
            status,
            completed_at: completed ? new Date().toISOString() : null,
            started_at: status === 'not_started' ? null : new Date().toISOString()
          })
          .eq('id', assignmentId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error updating assignment status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Assignment status updated');
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-due-assignments'] });
    },
    onError: (error) => {
      toast.error('Failed to update assignment status');
      console.error('Assignment update error:', error);
    }
  });

  return {
    assignment,
    isLoading,
    updateAssignmentStatus: (assignmentId: string, status: string, completed: boolean) => 
      updateAssignmentStatus.mutate({ assignmentId, status, completed })
  };
};
