
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLessonProgress = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch lesson progress
  const { data: lessonProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['student-lesson-progress', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching lesson progress for lessonId:', lessonId);
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      console.log('Lesson progress data:', data);
      
      // Handle case where data is null (no progress record yet)
      if (!data) return null;
      
      return {
        ...data,
        completed_sections: data.completed_sections || []
      };
    },
    enabled: !!lessonId
  });

  // Fetch assignment data for this lesson
  const { data: assignment } = useQuery({
    queryKey: ['student-lesson-assignment-detail', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      console.log('Fetching assignment for lessonId:', lessonId);
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, status, due_date')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log('Assignment data for lesson:', data);
      return data;
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
      
      try {
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
        
        // Only update the assignment if it exists and lesson is completed
        if (completed && assignment?.id) {
          console.log('Updating assignment status to completed:', assignment.id);
          
          const { error: assignmentError } = await supabase
            .from('student_assignments')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', assignment.id);
            
          if (assignmentError) {
            console.error('Error updating assignment status:', assignmentError);
            toast.error("Failed to update assignment status", {
              description: "Your lesson progress was saved, but we couldn't update the assignment status."
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in updateProgressMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates properly
      console.log('Invalidating queries after progress update');
      queryClient.invalidateQueries({ queryKey: ['student-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-all-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-recent-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-due-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment-detail'] });
    },
    onError: (error) => {
      console.error('Error updating lesson progress:', error);
      toast.error("Failed to update lesson progress", {
        description: "An error occurred while saving your progress. Please try again."
      });
    }
  });

  return {
    lessonProgress,
    progressLoading,
    assignment,
    updateProgress: updateProgressMutation.mutate,
    isUpdating: updateProgressMutation.isPending
  };
};
