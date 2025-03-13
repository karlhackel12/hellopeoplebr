
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionOption } from '../types';
import { QuizDetails, QuizQuestionData } from '../types/quizGeneration';

export class QuizService {
  /**
   * Checks if a quiz already exists for the given lesson
   */
  static async getExistingQuiz(lessonId: string): Promise<QuizDetails | null> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking existing quiz:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getExistingQuiz:', error);
      throw error;
    }
  }

  /**
   * Creates a new quiz entry in the database or updates an existing one
   */
  static async saveQuiz(lessonId: string, title: string = 'Lesson Quiz', existingQuizId?: string): Promise<QuizDetails> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      if (existingQuizId) {
        // Update existing quiz
        const { data, error } = await supabase
          .from('quizzes')
          .update({
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQuizId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title,
            created_by: user.user.id,
            is_published: false,
            pass_percent: 70
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error in saveQuiz:', error);
      throw error;
    }
  }

  /**
   * Removes existing questions and their options for a quiz
   */
  static async clearExistingQuestions(quizId: string): Promise<void> {
    try {
      // First find all question IDs for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId);
        
      if (questionsError) throw questionsError;
      
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id);
        
        // Delete all options for these questions first
        const { error: optionsError } = await supabase
          .from('quiz_question_options')
          .delete()
          .in('question_id', questionIds);
          
        if (optionsError) throw optionsError;
        
        // Now delete the questions
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);
          
        if (deleteError) throw deleteError;
      }
    } catch (error) {
      console.error('Error in clearExistingQuestions:', error);
      throw error;
    }
  }

  /**
   * Saves questions and options to the database
   */
  static async saveQuestions(quizId: string, questions: QuizQuestionData[]): Promise<Question[]> {
    try {
      const savedQuestions: Question[] = [];
      
      // Process each question sequentially to maintain order
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Insert the question
        const { data: savedQuestion, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: question.question_text,
            question_type: question.question_type,
            points: question.points,
            order_index: i
          })
          .select()
          .single();
          
        if (questionError) throw questionError;
        
        // Insert all options for this question
        const optionsToInsert = question.options.map((option, optIndex) => ({
          question_id: savedQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: optIndex
        }));
        
        const { data: savedOptions, error: optionsError } = await supabase
          .from('quiz_question_options')
          .insert(optionsToInsert)
          .select();
          
        if (optionsError) throw optionsError;
        
        // Add saved question with its options to the result array
        savedQuestions.push({
          ...savedQuestion,
          options: savedOptions
        });
      }
      
      return savedQuestions;
    } catch (error) {
      console.error('Error in saveQuestions:', error);
      throw error;
    }
  }

  /**
   * Fetches questions and their options for a quiz
   */
  static async getQuizQuestions(quizId: string): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quizId)
        .order('order_index');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getQuizQuestions:', error);
      throw error;
    }
  }

  /**
   * Updates a quiz's publish status
   */
  static async updatePublishStatus(quizId: string, isPublished: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error in updatePublishStatus:', error);
      throw error;
    }
  }

  /**
   * Deletes a quiz and all its questions/options
   */
  static async deleteQuiz(quizId: string): Promise<void> {
    try {
      // Clear questions and options first
      await this.clearExistingQuestions(quizId);
      
      // Then delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error in deleteQuiz:', error);
      throw error;
    }
  }
}
