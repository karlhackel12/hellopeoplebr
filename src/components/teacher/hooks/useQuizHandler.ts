
import { useQuizGeneration } from './quiz/useQuizGeneration';
import { useQuizFetching } from './quiz/useQuizFetching';
import { useQuizManagement } from './quiz/useQuizManagement';
import { QuizContentAnalyzer } from '../quiz/services/QuizContentAnalyzer';
import { Question, Quiz } from '../quiz/types';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Function to fetch lesson content for quiz generation
  const fetchLessonContent = async (): Promise<string | null> => {
    try {
      if (lessonContent && isContentLoaded) {
        return lessonContent;
      }
      
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (lesson?.content) {
        setLessonContent(lesson.content);
        setIsContentLoaded(true);
        return lesson.content;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      return null;
    }
  };

  // Enhanced quiz generation that analyzes content
  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      const content = await fetchLessonContent();
      if (!content) {
        return false;
      }
      
      // Analyze and optimize content for quiz generation
      const optimizedContent = QuizContentAnalyzer.prepareContentForQuizGeneration(
        content, 
        numQuestions
      );
      
      // Use optimized content for quiz generation
      return await generateQuiz(numQuestions, optimizedContent);
    } catch (error) {
      console.error("Error in smart quiz generation:", error);
      return false;
    }
  };

  // Re-export the functions and combine the loading/error states
  return {
    // Content Analysis
    fetchLessonContent,
    
    // Smart Generation
    generateSmartQuiz,
    
    // Original Generation
    generateQuiz,
    
    // Fetching
    fetchQuizQuestions,
    fetchQuizDetails,
    
    // Management
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    
    // Combined states
    loading: generationLoading || fetchLoading,
    saving,
    isRetrying,
    error: generationError || fetchError || managementError
  };
};
