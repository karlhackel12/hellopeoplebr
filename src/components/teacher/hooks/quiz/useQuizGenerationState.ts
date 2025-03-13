import { useState } from 'react';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';

export const useQuizGenerationState = () => {
  const [numQuestions, setNumQuestions] = useState('5');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [contentLoadingMessage, setContentLoadingMessage] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const clearErrors = () => {
    setLoadingError(null);
    setErrorDetails(null);
    if (currentPhase === 'error') {
      setCurrentPhase('idle');
    }
  };

  const setRetrying = (isRetrying: boolean) => {
    setIsRetrying(isRetrying);
  };

  const setContentLoading = (message: string | null) => {
    setContentLoadingMessage(message);
  };

  const setError = (message: string, details?: string) => {
    setLoadingError(message);
    setErrorDetails(details || null);
    setCurrentPhase('error');
  };

  const setGenerationPhase = (phase: GenerationPhase) => {
    setCurrentPhase(phase);
    
    // Set appropriate loading message based on phase
    switch (phase) {
      case 'loading':
        setContentLoadingMessage('Preparing to generate quiz...');
        break;
      case 'content-loading':
        setContentLoadingMessage('Loading lesson content for analysis...');
        break;
      case 'analyzing':
        setContentLoadingMessage('Analyzing lesson content to identify key concepts...');
        break;
      case 'generating':
        setContentLoadingMessage(isRetrying 
          ? 'Improving quiz questions for better quality...' 
          : 'Generating quiz questions based on content analysis...');
        break;
      case 'saving':
        setContentLoadingMessage('Saving quiz questions to database...');
        break;
      case 'complete':
      case 'idle':
        setContentLoadingMessage(null);
        break;
      case 'error':
        // Keep existing error message
        break;
    }
  };

  return {
    numQuestions,
    setNumQuestions,
    loadingError,
    setLoadingError,
    errorDetails,
    setErrorDetails,
    clearErrors,
    isRetrying,
    setRetrying,
    contentLoadingMessage,
    setContentLoading,
    currentPhase,
    setGenerationPhase,
    setError
  };
};
