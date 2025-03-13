
import { useState } from 'react';
import { toast } from 'sonner';
import { QuizQuestionData } from '../../quiz/types/quizGeneration';
import { useQuizGeneration } from './useQuizGeneration';
import { useQuizDataProcessor } from './useQuizDataProcessor';
import { Question } from '../../quiz/types';

export const useSmartQuizGeneration = (lessonId: string) => {
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  
  const { generateQuiz, loading: apiLoading, isRetrying, error: apiError } = useQuizGeneration();
  const { processQuizData, processing, error: processingError } = useQuizDataProcessor();
  
  /**
   * Unified error tracking
   */
  const error = apiError || processingError;
  
  /**
   * Unified loading state
   */
  const loading = generatingQuiz || apiLoading || savingQuiz || processing;
  
  /**
   * Main function to generate a smart quiz
   */
  const generateSmartQuiz = async (numQuestions: number): Promise<Question[]> => {
    try {
      setGeneratingQuiz(true);
      
      // Check for pre-generated quiz data in localStorage
      const storedQuizData = getStoredQuizData();
      let generationResponse;
      
      if (storedQuizData && storedQuizData.questions && storedQuizData.questions.length > 0) {
        console.log("Using pre-generated quiz questions:", storedQuizData.questions.length);
        generationResponse = {
          status: 'succeeded',
          questions: storedQuizData.questions as QuizQuestionData[]
        };
      } else {
        // Generate quiz via the edge function
        generationResponse = await generateQuiz(lessonId, numQuestions);
      }
      
      // Process and save the quiz data
      setSavingQuiz(true);
      const savedQuestions = await processQuizData(lessonId, generationResponse);
      setGeneratedQuestions(savedQuestions);
      
      toast.success('Quiz generated successfully', {
        description: `${savedQuestions.length} questions have been created.`
      });
      
      return savedQuestions;
    } catch (error: any) {
      console.error("Error in smart quiz generation:", error);
      toast.error('Quiz generation failed', {
        description: error.message || 'An unexpected error occurred'
      });
      return [];
    } finally {
      setGeneratingQuiz(false);
      setSavingQuiz(false);
    }
  };

  /**
   * Helper function to retrieve stored quiz data
   */
  const getStoredQuizData = () => {
    try {
      // Get the most recent quiz data from localStorage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('lesson_quiz_'));
      if (keys.length === 0) return null;
      
      // Sort by timestamp (newest first)
      keys.sort().reverse();
      const latestKey = keys[0];
      
      const quizData = localStorage.getItem(latestKey);
      if (!quizData) return null;
      
      // Parse the quiz data
      const parsedData = JSON.parse(quizData);
      
      // Clean up old quiz data
      if (keys.length > 1) {
        keys.slice(1).forEach(key => localStorage.removeItem(key));
      }
      
      // Remove the current one as well since we're using it now
      localStorage.removeItem(latestKey);
      
      return parsedData;
    } catch (error) {
      console.error("Error retrieving stored quiz data:", error);
      return null;
    }
  };

  return {
    generateSmartQuiz,
    loading,
    isRetrying,
    error,
    generatedQuestions
  };
};
