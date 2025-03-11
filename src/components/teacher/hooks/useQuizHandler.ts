
import { useQuizGeneration } from './quiz/useQuizGeneration';
import { useQuizFetching } from './quiz/useQuizFetching';
import { useQuizManagement } from './quiz/useQuizManagement';
import { Question } from '../quiz/types';

export const useQuizHandler = (lessonId: string) => {
  const { generateQuiz, loading: generationLoading, error: generationError } = useQuizGeneration(lessonId);
  const { fetchQuizQuestions, fetchQuizDetails, loading: fetchLoading, error: fetchError } = useQuizFetching(lessonId);
  const { saveQuizTitle, deleteQuiz, saving, error: managementError } = useQuizManagement(lessonId);

  // Re-export the functions and combine the loading/error states
  return {
    // Generation
    generateQuiz,
    
    // Fetching
    fetchQuizQuestions,
    fetchQuizDetails,
    
    // Management
    saveQuizTitle,
    deleteQuiz,
    
    // Combined states
    loading: generationLoading || fetchLoading,
    saving,
    error: generationError || fetchError || managementError
  };
};
