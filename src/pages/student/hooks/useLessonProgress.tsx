
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLessonProgress = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch lesson progress
  const { data: lessonProgress } = useQuery({
    queryKey: ['student-lesson-progress', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Handle case where data is null (no progress record yet)
      if (!data) return null;
      
      return {
        ...data,
        completed_sections: data.completed_sections || []
      };
    },
    enabled: !!lessonId
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ completed, sections }: { completed: boolean, sections?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const updateData = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        last_accessed_at: new Date().toISOString(),
        completed_sections: sections || []
      };
      
      console.log('Updating lesson progress:', { lessonId, completed, sections });
      
      if (lessonProgress) {
        const { error } = await supabase
          .from('user_lesson_progress')
          .update(updateData)
          .eq('id', lessonProgress.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            ...updateData
          });
        
        if (error) throw error;
      }
      
      // Update assignment status if lesson is completed
      if (completed) {
        const { error: assignmentError } = await supabase
          .from('student_assignments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('lesson_id', lessonId)
          .eq('student_id', user.id);
          
        if (assignmentError) console.error('Error updating assignment status:', assignmentError);
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates properly
      queryClient.invalidateQueries({ queryKey: ['student-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-all-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-recent-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-due-assignments'] });
    }
  });

  return {
    lessonProgress,
    updateProgress: updateProgressMutation.mutate
  };
};
