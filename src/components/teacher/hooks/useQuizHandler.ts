
import { useQuizGeneration } from './quiz/useQuizGeneration';
import { useQuizFetching } from './quiz/useQuizFetching';
import { useQuizManagement } from './quiz/useQuizManagement';
import { useQuizContent } from './quiz/useQuizContent';
import { useSmartQuizGeneration } from './quiz/useSmartQuizGeneration';
import { Question } from '../quiz/types';

export const useQuizHandler = (lessonId: string) => {
  const { 
    generateQuiz: generateQuizInternal, 
    loading: generationLoading, 
    isRetrying,
    error: generationError 
  } = useQuizGeneration(lessonId);
  
  const { 
    fetchQuizQuestions, 
    fetchQuizDetails, 
    loading: fetchLoading, 
    error: fetchError 
  } = useQuizFetching(lessonId);
  
  const { 
    saveQuizTitle, 
    deleteQuiz, 
    publishQuiz,
    unpublishQuiz,
    saving, 
    error: managementError 
  } = useQuizManagement(lessonId);

  const {
    getLessonContent,
    isContentLoaded
  } = useQuizContent(lessonId);

  const { generateSmartQuiz } = useSmartQuizGeneration(generateQuizInternal, getLessonContent);

  // Wrap the generator to return the expected type
  const generateQuiz = async (numQuestions: number = 5): Promise<Question[] | null> => {
    // Try to use the smart generator if we have a lesson ID
    if (lessonId) {
      return await generateSmartQuiz(numQuestions);
    } else {
      // For standalone quizzes, we need another approach - this would be implemented
      // in a real system to use default content or templates
      console.warn('Generating quiz without lesson context is not fully implemented');
      return null;
    }
  };

  return {
    fetchLessonContent: getLessonContent,
    generateSmartQuiz,
    generateQuiz,
    fetchQuizQuestions,
    fetchQuizDetails,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading: generationLoading || fetchLoading,
    saving,
    isRetrying,
    error: generationError || fetchError || managementError
  };
};
