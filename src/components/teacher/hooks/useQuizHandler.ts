
import { useQuizGeneration } from './quiz/useQuizGeneration';
import { useQuizFetching } from './quiz/useQuizFetching';
import { useQuizManagement } from './quiz/useQuizManagement';
import { useQuizContent } from './quiz/useQuizContent';
import { useSmartQuizGeneration } from './quiz/useSmartQuizGeneration';

export const useQuizHandler = (lessonId: string) => {
  const { 
    generateQuiz, 
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

  const { generateSmartQuiz } = useSmartQuizGeneration(generateQuiz, getLessonContent);

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
