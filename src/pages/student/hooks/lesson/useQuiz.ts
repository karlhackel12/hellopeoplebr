
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Quiz {
  id: string;
  title: string;
  description: string;
  pass_percent: number;
  is_published: boolean;
}

export const useQuiz = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['student-lesson-quiz', lessonId],
    queryFn: async (): Promise<Quiz | null> => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      console.log('Fetching quiz for lesson:', lessonId);
      
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          title, 
          description,
          pass_percent,
          is_published
        `)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching quiz:', error);
        throw error;
      }
      
      console.log('Quiz data loaded:', data ? `${data.title} (published: ${data.is_published})` : 'No quiz found');
      return data;
    },
    enabled: !!lessonId
  });
};
