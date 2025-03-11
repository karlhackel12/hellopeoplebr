
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from '../quiz/types';

interface QuizQuestion {
  question_text: string;
  points: number;
  question_type: 'multiple_choice';
  options: QuizOption[];
}

interface QuizOption {
  option_text: string;
  is_correct: boolean;
}

export const useQuizHandler = (lessonId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async (numQuestions: number = 5): Promise<boolean> => {
    if (!lessonId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // First, get the lesson content
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .single();
      
      if (lessonError || !lesson?.content) {
        throw new Error('Failed to fetch lesson content');
      }

      // Call the edge function to generate quiz questions
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          lessonContent: lesson.content,
          numQuestions
        }
      });

      if (error) throw error;

      // If successful, first check if we already have a quiz for this lesson
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      let quizId = existingQuiz?.id;

      // If no existing quiz, create a new quiz entry first
      if (!quizId) {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');
        
        const { data: newQuiz, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title: 'Lesson Quiz',
            created_by: user.user.id,
            is_published: false,
            pass_percent: 70
          })
          .select()
          .single();
        
        if (quizError) throw quizError;
        quizId = newQuiz.id;
      }

      // Now with a valid quizId, batch insert the questions and their options
      if (data?.questions && quizId) {
        // First, remove any existing questions for this quiz
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);

        if (deleteError) throw deleteError;

        // Insert new questions
        for (const [index, question] of data.questions.entries()) {
          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quizId,
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              order_index: index
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert options for this question
          const optionsToInsert = question.options.map((option: any, optionIndex: number) => ({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optionIndex
          }));

          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message);
      toast.error('Failed to generate quiz', {
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

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

      if (quizError) throw quizError;
      
      if (!quiz) return [];

      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index');

      if (questionsError) throw questionsError;

      return questions;
    } catch (error: any) {
      console.error('Error fetching quiz questions:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuiz,
    fetchQuizQuestions,
    loading,
    error
  };
};
