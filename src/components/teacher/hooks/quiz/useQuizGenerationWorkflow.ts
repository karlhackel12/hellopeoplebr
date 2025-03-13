
import { useState } from 'react';
import { toast } from 'sonner';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';

export const useQuizGenerationWorkflow = (
  fetchLessonContent: () => Promise<string | null>,
  generateSmartQuiz: (numQuestions: number) => Promise<boolean>,
  loadQuizPreview: () => Promise<any[] | null>,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  currentPhase: GenerationPhase,
  setGenerationPhase: (phase: GenerationPhase) => void,
  setError: (message: string, details?: string) => void,
  clearErrors: () => void,
  setContentLoading: (msg: string | null) => void,
) => {
  const generateQuiz = async (numQuestions: string): Promise<boolean> => {
    clearErrors();
    setGenerationPhase('content-loading');
    
    try {
      // Load content phase
      const content = await fetchLessonContent();
      
      if (!content) {
        setError('Could not load lesson content', 'Make sure your lesson has sufficient content before generating a quiz.');
        return false;
      }
      
      if (content.length < 100) {
        setError('Lesson content too short', 'Your lesson needs more content to generate meaningful quiz questions.');
        return false;
      }

      // Analyzing phase
      setGenerationPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback
      
      // Generation phase
      setGenerationPhase('generating');
      try {
        const success = await generateSmartQuiz(parseInt(numQuestions));
        
        if (success) {
          setGenerationPhase('saving');
          await loadQuizPreview();
          setExistingQuiz(true);
          setIsPublished(false);
          setGenerationPhase('complete');
          
          setTimeout(() => {
            if (currentPhase === 'complete') {
              setGenerationPhase('idle');
            }
          }, 2000);
          
          return true;
        } else {
          setError('Failed to generate quiz', 'The quiz generation process failed. Please try again later.');
          return false;
        }
      } catch (genError: any) {
        console.error("Error during quiz generation:", genError);
        setError(
          genError.message || 'Quiz generation failed', 
          genError.details || 'An unexpected error occurred during quiz generation.'
        );
        return false;
      }
    } catch (error: any) {
      console.error("Error in quiz generation flow:", error);
      setError(
        'Quiz generation error', 
        error.message || 'An unexpected error occurred during the quiz generation process.'
      );
      return false;
    }
  };

  return {
    generateQuiz
  };
};
