
import { useEffect } from 'react';

export const useQuizExistingData = (
  lessonId: string | undefined,
  fetchQuizDetails: () => Promise<any>,
  setExistingQuiz: (value: boolean) => void,
  setQuizTitle: (title: string) => void,
  setIsPublished: (value: boolean) => void,
  loadQuizPreview: () => Promise<any[] | null>,
  setLoadingError: (error: string | null) => void
) => {
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          setLoadingError(null);
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            setIsPublished(quizDetails.is_published || false);
            
            await loadQuizPreview();
          }
        } catch (error: any) {
          console.error("Error checking existing quiz:", error);
          setLoadingError(error.message);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId]);
};
