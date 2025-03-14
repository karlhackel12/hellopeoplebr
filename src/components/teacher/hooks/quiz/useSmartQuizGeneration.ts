
import { useState, useCallback } from 'react';
import { QuizGenerationResponse } from '../quiz/types/quizGeneration';

export const useSmartQuizGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSmartQuiz = useCallback(async (
    generateQuizFunc: (numQuestions?: number) => Promise<QuizGenerationResponse>,
    numQuestions = 5
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the provided quiz generation function
      const response = await generateQuizFunc(numQuestions);
      return response;
    } catch (error: any) {
      console.error('Error generating smart quiz:', error);
      setError(error.message || 'Failed to generate quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateSmartQuiz,
    loading,
    error
  };
};
