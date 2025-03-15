
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lesson } from '@/types/lesson';
import { toast } from 'sonner';

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
      
      if (error) {
        console.error('Error fetching lesson:', error);
        toast.error('Erro ao carregar a lição', {
          description: 'Não foi possível carregar os dados da lição'
        });
        throw error;
      }
      
      // Map the database fields to match the Lesson type
      if (data) {
        const lesson: Lesson = {
          id: data.id,
          created_at: data.created_at,
          title: data.title,
          content: data.content || '',
          teacher_id: data.created_by, // Map created_by to teacher_id
          is_published: data.is_published,
          structured_content: data.structured_content || null
        };
        console.log('Lesson data loaded:', lesson.title);
        return lesson;
      }
      
      return null;
    },
    enabled: !!lessonId,
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
