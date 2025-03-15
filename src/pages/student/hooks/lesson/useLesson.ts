
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types/lesson';

export const useLesson = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async (): Promise<Lesson | null> => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      console.log('Lesson data loaded:', data?.title);
      return data;
    },
    enabled: !!lessonId
  });
};
