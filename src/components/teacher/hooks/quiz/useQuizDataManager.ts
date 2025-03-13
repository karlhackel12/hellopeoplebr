
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionOption } from '../../quiz/types';
import { toast } from 'sonner';

interface QuizData {
  title: string;
  questions: Question[];
  passPercent: number;
  isPublished: boolean;
}

export const useQuizDataManager = (lessonId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async (): Promise<Question[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the quiz for this lesson
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();
        
      if (quizError) throw quizError;
      if (!quiz) return null;
      
      // Then get questions and options
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          id, quiz_id, question_text, question_type, points, order_index,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index');
        
      if (questionsError) throw questionsError;
      
      // Map to the expected Question format
      return questions.map(question => {
        // Map options to the expected QuestionOption format
        const mappedOptions: QuestionOption[] = question.options.map(option => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index || 0,
          question_id: option.question_id
        }));
        
        return {
          id: question.id,
          quiz_id: question.quiz_id,
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          order_index: question.order_index,
          options: mappedOptions
        };
      });
      
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setError('Failed to load quiz questions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (title: string, passPercent: number = 70): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          lesson_id: lessonId,
          title,
          pass_percent: passPercent,
          is_published: false,
          created_by: user.id
        })
        .select('id')
        .single();
        
      if (quizError) throw quizError;
      
      return quiz.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError('Failed to create quiz');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveQuestions = async (quizId: string, questions: Question[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // For each question
      for (const question of questions) {
        // Insert question
        const { data: savedQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points,
            order_index: question.order_index
          })
          .select('id')
          .single();
          
        if (questionError) throw questionError;
        
        // Insert options for this question
        const optionsToInsert = question.options.map(option => ({
          question_id: savedQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index || 0
        }));
        
        const { error: optionsError } = await supabase
          .from('quiz_question_options')
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving quiz questions:', error);
      setError('Failed to save quiz questions');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveQuizData = async (data: QuizData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get quiz ID if it exists
      const { data: existingQuiz, error: quizQueryError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();
        
      if (quizQueryError) throw quizQueryError;
      
      let quizId: string;
      
      if (existingQuiz) {
        // Update existing quiz
        quizId = existingQuiz.id;
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            title: data.title,
            pass_percent: data.passPercent,
            is_published: data.isPublished
          })
          .eq('id', quizId);
          
        if (updateError) throw updateError;
        
        // Clear existing questions
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new quiz
        const newQuizId = await createQuiz(data.title, data.passPercent);
        if (!newQuizId) {
          throw new Error('Failed to create quiz');
        }
        quizId = newQuizId;
      }
      
      // Save questions
      if (data.questions.length > 0) {
        const saveSuccess = await saveQuestions(quizId, data.questions);
        if (!saveSuccess) {
          throw new Error('Failed to save questions');
        }
      }
      
      toast.success('Quiz saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to save quiz');
      toast.error('Failed to save quiz');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchQuestions,
    createQuiz,
    saveQuestions,
    saveQuizData,
    loading,
    error
  };
};
