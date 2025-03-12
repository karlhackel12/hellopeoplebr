
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question, Quiz } from '../../quiz/types';

export const useQuizFetching = (lessonId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizQuestions = async (): Promise<Question[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // First, find the quiz ID for this lesson
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (quizError) {
        console.error('Error fetching quiz:', quizError);
        throw new Error(quizError.message || 'Failed to fetch quiz');
      }
      
      if (!quiz) return [];

      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (questionsError) {
        console.error('Error fetching quiz questions:', questionsError);
        throw new Error(questionsError.message || 'Failed to fetch quiz questions');
      }

      return questions;
    } catch (error: any) {
      console.error('Error fetching quiz questions:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizDetails = async (): Promise<Quiz | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (quizError) {
        console.error('Error fetching quiz details:', quizError);
        throw new Error(quizError.message || 'Failed to fetch quiz details');
      }
      
      return quiz;
    } catch (error: any) {
      console.error('Error fetching quiz details:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchQuizQuestions,
    fetchQuizDetails,
    loading,
    error
  };
};
