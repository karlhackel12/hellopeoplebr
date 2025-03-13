
import { useState } from 'react';
import { toast } from 'sonner';
import { executeWithRetry } from './utils/retryLogic';
import { generateQuizContent, fetchLessonContent, handleQuizGenerationError } from './api/quizGenerationApi';
import { getExistingQuiz, createNewQuiz, clearExistingQuestions, saveQuestionWithOptions } from './api/quizDatabaseOps';

export const useQuizGeneration = (lessonId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const generateQuiz = async (numQuestions: number = 5, optimizedContent?: string): Promise<boolean> => {
    if (!lessonId) {
      toast.error('Missing lesson ID', {
        description: 'Cannot generate quiz without a lesson ID',
      });
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get lesson content if not provided
      let lessonContent = optimizedContent;
      if (!lessonContent) {
        lessonContent = await fetchLessonContent(lessonId);
      }

      if (!lessonContent || lessonContent.length < 50) {
        toast.error('Insufficient lesson content', {
          description: 'The lesson needs more content before generating a quiz.',
        });
        return false;
      }

      console.log('Content length for quiz generation:', lessonContent.length);
      console.log('Number of questions requested:', numQuestions);

      // Call the edge function to generate quiz questions with retry logic
      setIsRetrying(false);
      const { result, error: apiError, attempts } = await executeWithRetry(
        () => generateQuizContent(lessonContent!, numQuestions),
        2, // max attempts
        1000 // delay between retries
      );
      
      // Set retrying state based on attempts
      if (attempts > 1) {
        setIsRetrying(true);
      }

      if (apiError || !result?.data) {
        throw apiError || new Error('Failed to generate quiz content');
      }

      setIsRetrying(false);
      const data = result.data;

      // Handle quiz database operations
      const existingQuiz = await getExistingQuiz(lessonId);
      let quizId = existingQuiz?.id;

      // If no existing quiz, create a new one
      if (!quizId) {
        const newQuiz = await createNewQuiz(lessonId);
        quizId = newQuiz.id;
      }

      // Now with a valid quizId, save the questions and their options
      if (data?.questions && quizId) {
        // First, remove any existing questions for this quiz
        await clearExistingQuestions(quizId);

        // Insert new questions and their options
        for (const [index, question] of data.questions.entries()) {
          await saveQuestionWithOptions(quizId, question, index);
        }

        toast.success('Quiz generated successfully', {
          description: `${data.questions.length} questions have been created.`,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      handleQuizGenerationError(error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  return {
    generateQuiz,
    loading,
    isRetrying,
    error
  };
};
