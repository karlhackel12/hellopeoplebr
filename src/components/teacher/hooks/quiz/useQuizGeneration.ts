
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { executeWithRetry } from './utils/retryLogic';
import { QuizGenerationResponse } from '../../quiz/types/quizGeneration';

export const useQuizGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  /**
   * Fetch lesson content from the database
   */
  const fetchLessonContent = async (lessonId: string): Promise<string | null> => {
    try {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching lesson content:', error);
        throw error;
      }
      
      if (!lesson?.content) {
        console.warn('No content found for lesson');
        return null;
      }
      
      return lesson.content;
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      throw error;
    }
  };
  
  /**
   * Generate quiz content by calling the edge function
   */
  const generateQuizContent = async (lessonContent: string, numQuestions: number = 5): Promise<QuizGenerationResponse> => {
    try {
      // Check if content is pre-formatted quiz data
      let preGenerated = null;
      try {
        const parsedContent = JSON.parse(lessonContent);
        if (parsedContent?.questions && Array.isArray(parsedContent.questions)) {
          preGenerated = parsedContent;
        }
      } catch (e) {
        // Not JSON, treat as regular content
      }

      if (preGenerated) {
        console.log("Using pre-generated quiz questions");
        return {
          status: 'succeeded',
          questions: preGenerated.questions
        };
      }
      
      // Call the edge function
      const response = await supabase.functions.invoke('generate-quiz', {
        body: { 
          lessonContent,
          numQuestions
        }
      });

      if (response.error) {
        console.error('Error from edge function:', response.error);
        throw response.error;
      }

      return response.data as QuizGenerationResponse;
    } catch (error: any) {
      console.error('Error in quiz generation API:', error);
      throw error;
    }
  };

  /**
   * Generate a quiz with retry functionality
   */
  const generateQuiz = async (lessonId: string, numQuestions: number = 5): Promise<QuizGenerationResponse> => {
    if (!lessonId) {
      throw new Error('Lesson ID is required to generate a quiz');
    }
    
    try {
      setLoading(true);
      setError(null);
      setIsRetrying(false);
      
      // Get lesson content
      const content = await fetchLessonContent(lessonId);
      
      if (!content || content.length < 50) {
        throw new Error('Insufficient lesson content to generate a quiz');
      }

      console.log('Content length for quiz generation:', content.length);
      
      // Call the quiz generation with retry logic
      const { result, error: apiError, attempts } = await executeWithRetry(
        () => generateQuizContent(content, numQuestions),
        2, // max attempts
        1000 // delay between retries
      );
      
      // Set retrying state if we made multiple attempts
      if (attempts > 1) {
        setIsRetrying(true);
      }

      if (apiError || !result) {
        throw apiError || new Error('Failed to generate quiz content');
      }

      return result as QuizGenerationResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      console.error('Error generating quiz:', error);
      setError(errorMessage);
      
      // Show toast message with user-friendly error
      toast.error('Failed to generate quiz', {
        description: errorMessage
      });
      
      throw error;
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  return {
    generateQuiz,
    fetchLessonContent,
    loading,
    isRetrying,
    error
  };
};
