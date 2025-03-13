
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/teacher/quiz/types';
import { executeDbOperationWithRetry } from './utils/retryLogic';
import { toast } from 'sonner';

export const useQuizDataManager = (lessonId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  /**
   * Fetch questions for a specific quiz
   */
  const fetchQuizQuestions = async (quizId?: string): Promise<Question[]> => {
    if (!quizId) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          quiz_id,
          question_text,
          question_type,
          points,
          order_index,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quizId)
        .order('order_index');
      
      if (error) throw error;
      
      // Transform the data to match our Question type
      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        order_index: q.order_index,
        options: q.options.map(o => ({
          id: o.id,
          option_text: o.option_text,
          is_correct: o.is_correct,
          quiz_question_id: o.quiz_question_id
        }))
      }));
      
      setQuestions(formattedQuestions);
      return formattedQuestions;
    } catch (error: any) {
      console.error('Error fetching quiz questions:', error);
      toast.error('Failed to load quiz questions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Save a new quiz with its questions
   */
  const saveQuiz = async (title: string, questions: Question[], isPublished: boolean = false): Promise<boolean> => {
    if (!lessonId) return false;
    setIsLoading(true);
    
    try {
      // Create or update the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .upsert({
          lesson_id: lessonId,
          title,
          pass_percent: 70,
          is_published: isPublished
        })
        .select()
        .single();
      
      if (quizError) throw quizError;
      
      // Save the questions
      const quizId = quiz.id;
      
      // Create questions with the proper structure
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Insert the question
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .upsert({
            quiz_id: quizId,
            question_text: q.question_text,
            question_type: q.question_type,
            points: q.points,
            order_index: i
          })
          .select()
          .single();
        
        if (questionError) throw questionError;
        
        // Insert the options
        if (q.options && q.options.length > 0) {
          const options = q.options.map(opt => ({
            quiz_question_id: questionData.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          }));
          
          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .upsert(options);
          
          if (optionsError) throw optionsError;
        }
      }
      
      toast.success('Quiz saved successfully');
      return true;
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    questions,
    isLoading,
    fetchQuizQuestions,
    saveQuiz
  };
};
