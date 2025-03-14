
import { useState, useCallback } from 'react';
import { GenerationPhase } from '../../quiz/types/quizGeneration';
import { Question } from '../../quiz/types';
import { useQuizActionWrappers } from './useQuizActionWrappers';
import { useQuizGeneration } from './useQuizGeneration';
import { useQuizDataProcessor } from './useQuizDataProcessor';
import { useQuizExistingData } from './useQuizExistingData';

export const useQuizGenerationWorkflow = (
  lessonId: string,
  setGenerationPhase: (phase: GenerationPhase) => void,
  setError: (error: string) => void,
  clearErrors: () => void
) => {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(false);
  
  const { generateQuiz, isRetrying } = useQuizGeneration();
  const { processQuizData } = useQuizDataProcessor();
  const { checkExistingQuiz } = useQuizExistingData();
  const { withErrorHandling } = useQuizActionWrappers();

  // Function to handle quiz generation workflow
  const handleGenerateQuiz = useCallback(async (numQuestions: number = 5) => {
    setLoading(true);
    clearErrors();
    
    try {
      // Check if quiz already exists
      const hasExistingQuiz = await checkExistingQuiz(lessonId);
      setExistingQuiz(hasExistingQuiz);
      
      // Set generation phase
      setGenerationPhase('generation');
      
      // Generate quiz questions
      const generationResponse = await generateQuiz(numQuestions);
      
      if (!generationResponse) {
        throw new Error('Failed to generate quiz questions');
      }
      
      // Process and save quiz data
      setGenerationPhase('saving');
      const questions = await processQuizData(lessonId, generationResponse);
      
      if (!questions || questions.length === 0) {
        throw new Error('Failed to process quiz data');
      }
      
      setQuizQuestions(questions);
      setGenerationPhase('completed');
      return questions;
    } catch (error: any) {
      console.error('Error in quiz generation workflow:', error);
      setError(error.message || 'Quiz generation failed');
      setGenerationPhase('failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [lessonId, generateQuiz, processQuizData, setGenerationPhase, setError, clearErrors, checkExistingQuiz]);

  return {
    handleGenerateQuiz,
    quizQuestions,
    existingQuiz,
    setExistingQuiz,
    loading,
    isRetrying
  };
};
