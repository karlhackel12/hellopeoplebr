
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
      
      // Map the database fields to match the Lesson type
      if (data) {
        const lesson: Lesson = {
          id: data.id,
          created_at: data.created_at,
          title: data.title,
          content: data.content || '',
          teacher_id: data.created_by, // Map created_by to teacher_id
        };
        console.log('Lesson data loaded:', lesson.title);
        return lesson;
      }
      
      return null;
    },
    enabled: !!lessonId
  });
};
