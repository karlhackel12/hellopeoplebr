
import { useState } from 'react';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';

export const useQuizGenerationState = () => {
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isRetrying, setRetrying] = useState(false);
  const [contentLoadingMessage, setContentLoading] = useState<string | null>(null);
  const [currentPhase, setGenerationPhase] = useState<GenerationPhase>('idle');

  const setError = (message: string | null, details?: string) => {
    setLoadingError(message);
    setErrorDetails(details || null);
  };

  const clearErrors = () => {
    setLoadingError(null);
    setErrorDetails(null);
  };

  return {
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
