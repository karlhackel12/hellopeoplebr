
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAssignmentData = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: assignment } = useQuery({
    queryKey: ['student-lesson-assignment', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, status, title, description, due_date')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId
  });

  const updateAssignmentStatus = async (assignmentId: string, status: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('student_assignments')
        .update({
          status,
          completed_at: completed ? new Date().toISOString() : null,
          started_at: new Date().toISOString()
        })
        .eq('id', assignmentId);
      
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment'] });
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  };

  return {
    assignment,
    updateAssignmentStatus
  };
};
