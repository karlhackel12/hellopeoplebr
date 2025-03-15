
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/teacher/quiz/types';

export const useQuizQuestions = (quizId: string | undefined, isPublished: boolean = false) => {
  return useQuery({
    queryKey: ['student-quiz-questions', quizId],
    queryFn: async (): Promise<Question[]> => {
      if (!quizId) throw new Error('Quiz ID is required');
      
      // If quiz is not published, don't try to fetch the questions
      if (!isPublished) {
        console.log('Quiz exists but is not published, skipping questions fetch');
        return [];
      }
      
      console.log('Fetching questions for quiz:', quizId);
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          question_type,
          points,
          order_index,
          options:quiz_question_options (
            id,
            option_text,
            is_correct,
            order_index
          )
        `)
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('Error fetching quiz questions:', error);
        throw error;
      }
      
      console.log('Quiz questions loaded:', data?.length || 0);
      
      // Ensure the data matches the Question type
      const formattedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order_index: q.order_index,
        options: q.options.map((option: any) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index || 0
        }))
      }));
      
      return formattedQuestions;
    },
    enabled: !!quizId && isPublished
  });
};
