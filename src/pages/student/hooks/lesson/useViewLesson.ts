
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useViewLesson = (lessonId: string | undefined, isLessonLoading: boolean) => {
  const queryClient = useQueryClient();
  
  const viewLessonMutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const now = new Date().toISOString();
      
      // Use upsert operation to avoid conflicts and simplify the code
      await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          last_accessed_at: now
        }, {
          onConflict: 'user_id,lesson_id',
          ignoreDuplicates: false
        });
      
      // If there's an assignment, update its status to "in_progress" if it's "not_started"
      const { data: assignment } = await supabase
        .from('student_assignments')
        .select('id, status')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (assignment && assignment.status === 'not_started') {
        await supabase
          .from('student_assignments')
          .update({ 
            status: 'in_progress',
            started_at: now
          })
          .eq('id', assignment.id);
        
        console.log('Updated assignment status to in_progress:', assignment.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-recent-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-due-assignments'] });
    }
  });

  // Call the viewLesson mutation when the hook is initialized
  useEffect(() => {
    if (lessonId && !isLessonLoading) {
      viewLessonMutation.mutate();
    }
  }, [lessonId, isLessonLoading]);

  return {
    isUpdatingViewStatus: viewLessonMutation.isPending
  };
};
