
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentLessons = () => {
  const { data: recentLessons, isLoading } = useQuery({
    queryKey: ['student-recent-lessons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Get lessons with progress
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          is_published,
          user_lesson_progress!inner(
            user_id,
            last_accessed_at
          )
        `)
        .eq('user_lesson_progress.user_id', user.id)
        .eq('is_published', true)
        .order('user_lesson_progress.last_accessed_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      
      // Get progress for each lesson
      const lessonsWithProgress = await Promise.all(
        (data || []).map(async (lesson) => {
          const { data: progress } = await supabase
            .from('user_lesson_progress')
            .select('completed')
            .eq('user_id', user.id)
            .eq('lesson_id', lesson.id)
            .maybeSingle();
          
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            is_published: lesson.is_published,
            progress: {
              completed: progress?.completed || false
            }
          };
        })
      );
      
      return lessonsWithProgress;
    }
  });
  
  return { recentLessons, isLoading };
};
