
import { useState } from 'react';
import { toast } from 'sonner';

export const useQuizGenerationState = () => {
  const [numQuestions, setNumQuestions] = useState('5');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [contentLoadingMessage, setContentLoadingMessage] = useState<string | null>(null);

  const clearErrors = () => {
    setLoadingError(null);
  };

  const setRetrying = (isRetrying: boolean) => {
    setIsRetrying(isRetrying);
  };

  const setContentLoading = (message: string | null) => {
    setContentLoadingMessage(message);
  };

  return {
    numQuestions,
    setNumQuestions,
    loadingError,
    setLoadingError,
    clearErrors,
    isRetrying,
    setRetrying,
    contentLoadingMessage,
    setContentLoading
  };
};
