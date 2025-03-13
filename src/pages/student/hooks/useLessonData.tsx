
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLessonData = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId
  });

  // Fetch quiz data
  const { data: quiz } = useQuery({
    queryKey: ['student-lesson-quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
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
        .eq('is_published', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!lessonId
  });

  // Fetch quiz questions if quiz exists
  const { data: quizQuestions } = useQuery({
    queryKey: ['student-quiz-questions', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) throw new Error('Quiz ID is required');
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          question_type,
          points,
          options:quiz_question_options (
            id,
            option_text
          )
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!quiz?.id
  });

  return {
    lesson,
    lessonLoading,
    quiz,
    quizQuestions
  };
};
