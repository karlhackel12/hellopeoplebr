
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStudentAssignments = () => {
  const { data: dueAssignments, isLoading } = useQuery({
    queryKey: ['student-due-assignments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select(`
          id,
          title,
          description,
          status,
          due_date,
          lesson_id,
          lessons:lessons(
            id,
            title,
            estimated_minutes
          )
        `)
        .eq('student_id', user.id)
        .in('status', ['not_started', 'in_progress'])
        .order('due_date', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      
      // Get progress for each assignment
      const assignmentsWithProgress = await Promise.all(
        (data || []).map(async (assignment) => {
          if (assignment.lesson_id) {
            const { data: progress } = await supabase
              .from('user_lesson_progress')
              .select('completed')
              .eq('user_id', user.id)
              .eq('lesson_id', assignment.lesson_id)
              .maybeSingle();
            
            return {
              ...assignment,
              progress: {
                completed: progress?.completed || false
              }
            };
          }
          
          return {
            ...assignment,
            progress: {
              completed: false
            }
          };
        })
      );
      
      return assignmentsWithProgress;
    }
  });
  
  return { dueAssignments, isLoading };
};
