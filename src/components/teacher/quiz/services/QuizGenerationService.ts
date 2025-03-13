
import { supabase } from '@/integrations/supabase/client';
import { Question } from '../types';
import { toast } from 'sonner';

/**
 * Service class to handle quiz generation using Replicate
 */
export class QuizGenerationService {
  /**
   * Generates quiz questions using Replicate AI model through edge function
   */
  static async generateWithReplicate(
    quizTitle: string, 
    quizDescription: string = '', 
    numQuestions: number = 5
  ): Promise<Question[] | null> {
    try {
      console.log(`Generating quiz "${quizTitle}" with ${numQuestions} questions using Replicate`);
      
      // Ensure we have a valid title
      if (!quizTitle?.trim()) {
        throw new Error('Quiz title is required for AI generation');
      }
      
      const response = await supabase.functions.invoke('generate-quiz-replicate', {
        body: { 
          quizTitle,
          quizDescription,
          numQuestions
        }
      });
      
      if (response.error) {
        console.error('Error from edge function:', response.error);
        throw new Error(response.error.message || 'Failed to generate quiz');
      }
      
      if (!response.data?.questions || !Array.isArray(response.data.questions)) {
        throw new Error('Invalid response format from quiz generation');
      }
      
      return response.data.questions;
    } catch (error: any) {
      console.error('Error in quiz generation with Replicate:', error);
      toast.error('Quiz generation failed', {
        description: error.message || 'An unexpected error occurred',
      });
      return null;
    }
  }

  /**
   * Handles storing generated questions in the database
   */
  static async saveGeneratedQuestions(
    quizId: string,
    questions: Question[]
  ): Promise<boolean> {
    try {
      // First clear existing questions for this quiz
      const { error: clearError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);
      
      if (clearError) throw clearError;
      
      // Now insert the questions one by one with their options
      for (const [index, question] of questions.entries()) {
        // Create the question
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: question.question_text,
            question_type: question.question_type || 'multiple_choice',
            points: question.points || 1,
            order_index: index
          })
          .select()
          .single();
        
        if (questionError) throw questionError;
        
        // Create the options for this question
        if (question.options && question.options.length > 0) {
          const optionsToInsert = question.options.map((option, optIndex) => ({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optIndex
          }));
          
          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (optionsError) throw optionsError;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving generated questions:', error);
      toast.error('Failed to save questions', {
        description: 'The quiz was generated but could not be saved to the database',
      });
      return false;
    }
  }
}
