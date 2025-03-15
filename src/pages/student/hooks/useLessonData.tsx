
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question, QuestionOption } from '@/components/teacher/quiz/types';

export const useLessonData = (lessonId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async () => {
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

  // Fetch quiz data - make sure we're looking for any quiz, not just published ones
  const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['student-lesson-quiz', lessonId],
    queryFn: async () => {
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

  // Fetch quiz questions if quiz exists
  const { data: quizQuestions, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['student-quiz-questions', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) throw new Error('Quiz ID is required');
      
      console.log('Fetching questions for quiz:', quiz.id);
      
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
        .eq('quiz_id', quiz.id)
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
          order_index: option.order_index || 0 // Add default value for order_index if it's missing
        }))
      }));
      
      return formattedQuestions;
    },
    enabled: !!quiz?.id
  });

  const hasErrors = !!lessonError || !!quizError || !!questionsError;
  if (hasErrors) {
    console.error('Errors in useLessonData:', { lessonError, quizError, questionsError });
  }

  return {
    lesson,
    lessonLoading,
    quiz,
    quizLoading,
    quizQuestions: quizQuestions || [],
    questionsLoading,
    hasQuiz: !!quiz
  };
};
