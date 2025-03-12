
import { useQuizGeneration } from './quiz/useQuizGeneration';
import { useQuizFetching } from './quiz/useQuizFetching';
import { useQuizManagement } from './quiz/useQuizManagement';
import { QuizContentAnalyzer } from '../quiz/services/QuizContentAnalyzer';
import { Question, Quiz } from '../quiz/types';
import { useState } from 'react';
import { fetchLessonContent as apiFetchLessonContent } from './quiz/api/quizGenerationApi';

export const useQuizHandler = (lessonId: string) => {
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  
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

  const fetchLessonContent = async (): Promise<string | null> => {
    try {
      if (lessonContent && isContentLoaded) {
        return lessonContent;
      }
      
      const content = await apiFetchLessonContent(lessonId);
      
      if (content) {
        setLessonContent(content);
        setIsContentLoaded(true);
        return content;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      return null;
    }
  };

  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      const content = await fetchLessonContent();
      if (!content) {
        return false;
      }
      
      const optimizedContent = QuizContentAnalyzer.prepareContentForQuizGeneration(
        content, 
        numQuestions
      );
      
      return await generateQuiz(numQuestions, optimizedContent);
    } catch (error) {
      console.error("Error in smart quiz generation:", error);
      return false;
    }
  };

  return {
    fetchLessonContent,
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
