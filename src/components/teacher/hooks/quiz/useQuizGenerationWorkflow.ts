
import { useState } from 'react';
import { toast } from 'sonner';
import { GenerationPhase } from '../../quiz/types/quizGeneration';
import { useSmartQuizGeneration } from './useSmartQuizGeneration';
import { Question } from '../../quiz/types';

export const useQuizGenerationWorkflow = (
  lessonId: string,
  setGenerationPhase: (phase: GenerationPhase) => void,
  setError: (message: string, details?: string) => void,
  clearErrors: () => void
) => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [existingQuiz, setExistingQuiz] = useState(false);
  
  const {
    generateSmartQuiz,
    loading,
    isRetrying,
    error
  } = useSmartQuizGeneration(lessonId);
  
  /**
   * Main function to handle the entire quiz generation workflow
   */
  const handleGenerateQuiz = async (numQuestions: string): Promise<boolean> => {
    if (!lessonId) {
      toast.error("Lesson ID is required to generate a quiz");
      return false;
    }
    
    clearErrors();
    setGenerationPhase('loading');
    
    try {
      // Loading content phase
      setGenerationPhase('content-loading');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback
      
      // Analysis phase
      setGenerationPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback
      
      // Generation phase
      setGenerationPhase('generating');
      
      // Generate the smart quiz
      const questions = await generateSmartQuiz(parseInt(numQuestions));
      
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setExistingQuiz(true);
        setGenerationPhase('saving');
        
        // Brief delay to show the saving state
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        setGenerationPhase('complete');
        
        // Reset to idle after a delay
        setTimeout(() => {
          setGenerationPhase('idle');
        }, 2000);
        
        return true;
      } else {
        setError('Failed to generate quiz', 'No questions were generated. Please try again.');
        return false;
      }
    } catch (error: any) {
      console.error("Error in quiz generation workflow:", error);
      setError(
        'Quiz generation failed', 
        error.message || 'An unexpected error occurred during the quiz generation process.'
      );
      return false;
    }
  };
  
  // Watch for errors from the underlying hooks
  if (error) {
    setError('Quiz generation failed', error);
  }
  
  return {
    handleGenerateQuiz,
    quizQuestions,
    existingQuiz,
    setExistingQuiz,
    loading,
    isRetrying
  };
};
