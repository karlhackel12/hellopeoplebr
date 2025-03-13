
import { useState, useCallback } from 'react';
import { GenerationPhase } from '../../lesson/quiz/components/QuizGenerationProgress';

export interface QuizGenerationState {
  loadingError: string | null;
  errorDetails: string | null;
  isRetrying: boolean;
  contentLoadingMessage: string | null;
  currentPhase: GenerationPhase;
  generationStartTime: number | null;
  processingTime: number | null;
  hasCompletedOnce: boolean;
}

export const useQuizGenerationState = () => {
  const [state, setState] = useState<QuizGenerationState>({
    loadingError: null,
    errorDetails: null,
    isRetrying: false,
    contentLoadingMessage: null,
    currentPhase: 'idle',
    generationStartTime: null,
    processingTime: null,
    hasCompletedOnce: false
  });

  const setLoadingError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, loadingError: error }));
  }, []);

  const setErrorDetails = useCallback((details: string | null) => {
    setState(prev => ({ ...prev, errorDetails: details }));
  }, []);

  const setRetrying = useCallback((retrying: boolean) => {
    setState(prev => ({ ...prev, isRetrying: retrying }));
  }, []);

  const setContentLoading = useCallback((message: string | null) => {
    setState(prev => ({ ...prev, contentLoadingMessage: message }));
  }, []);

  const setGenerationPhase = useCallback((phase: GenerationPhase) => {
    setState(prev => {
      // Record start time when transitioning from idle to any active state
      let startTime = prev.generationStartTime;
      if (prev.currentPhase === 'idle' && phase !== 'idle') {
        startTime = Date.now();
      }
      
      // Calculate processing time when completing or erroring
      let processingTime = prev.processingTime;
      if ((phase === 'complete' || phase === 'error') && startTime) {
        processingTime = Date.now() - startTime;
      }
      
      // Track if we've ever completed a generation
      const hasCompletedOnce = phase === 'complete' ? true : prev.hasCompletedOnce;
      
      return {
        ...prev,
        currentPhase: phase,
        generationStartTime: startTime,
        processingTime,
        hasCompletedOnce
      };
    });
  }, []);

  const setError = useCallback((message: string | null, details?: string) => {
    setState(prev => ({
      ...prev,
      loadingError: message,
      errorDetails: details || null
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      loadingError: null,
      errorDetails: null
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      loadingError: null,
      errorDetails: null,
      isRetrying: false,
      contentLoadingMessage: null,
      currentPhase: 'idle',
      generationStartTime: null,
      processingTime: null,
      hasCompletedOnce: state.hasCompletedOnce // Keep this value
    });
  }, [state.hasCompletedOnce]);

  // Calculate generation metrics
  const metrics = {
    isInProgress: state.currentPhase !== 'idle' && state.currentPhase !== 'complete' && state.currentPhase !== 'error',
    hasError: state.currentPhase === 'error',
    isComplete: state.currentPhase === 'complete',
    processingTimeMs: state.processingTime,
    processingTimeFormatted: state.processingTime 
      ? `${(state.processingTime / 1000).toFixed(1)}s` 
      : null,
    hasCompletedOnce: state.hasCompletedOnce
  };

  return {
    // State values
    loadingError: state.loadingError,
    errorDetails: state.errorDetails,
    isRetrying: state.isRetrying,
    contentLoadingMessage: state.contentLoadingMessage,
    currentPhase: state.currentPhase,
    
    // State setters
    setLoadingError,
    setErrorDetails,
    setRetrying,
    setContentLoading,
    setGenerationPhase,
    setError,
    clearErrors,
    resetState,
    
    // Computed metrics
    ...metrics
  };
};
