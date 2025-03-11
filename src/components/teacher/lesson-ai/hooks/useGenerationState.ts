
import { useState } from 'react';
import { GeneratedLessonContent } from '../types';
import { GenerationState } from './types';

// Constants
const DEFAULT_POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLL_COUNT = 40; // Maximum number of polling attempts (2 minutes at 3-second intervals)

export const useGenerationState = () => {
  const [state, setState] = useState<GenerationState>({
    generating: false,
    generatedContent: null,
    level: 'beginner',
    instructions: '',
    error: null,
    retryCount: 0,
    generationStatus: 'idle',
    generationId: undefined,
    pollingInterval: DEFAULT_POLLING_INTERVAL,
    pollCount: 0,
    maxPollCount: MAX_POLL_COUNT,
    isCancelled: false
  });

  const setGenerating = (generating: boolean) => {
    setState(prev => ({ ...prev, generating }));
    if (!generating) {
      // Reset polling state when generation stops
      setState(prev => ({ 
        ...prev, 
        pollCount: 0,
        lastPollTime: undefined,
        generationId: undefined
      }));
    }
  };

  const setGeneratedContent = (generatedContent: GeneratedLessonContent | null) => {
    setState(prev => ({ ...prev, generatedContent }));
  };

  const setLevel = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setState(prev => ({ ...prev, level }));
  };

  const setInstructions = (instructions: string) => {
    setState(prev => ({ ...prev, instructions }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const incrementRetryCount = () => {
    setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
  };

  const resetRetryCount = () => {
    setState(prev => ({ ...prev, retryCount: 0 }));
  };

  const clearErrors = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const setGenerationStatus = (status: GenerationState['generationStatus']) => {
    setState(prev => ({ ...prev, generationStatus: status }));
  };

  const setGenerationId = (id: string | undefined) => {
    setState(prev => ({ ...prev, generationId: id }));
  };

  const setPollingInterval = (interval: number) => {
    setState(prev => ({ ...prev, pollingInterval: interval }));
  };

  const incrementPollCount = () => {
    setState(prev => ({ ...prev, pollCount: prev.pollCount + 1, lastPollTime: Date.now() }));
  };

  const resetPollCount = () => {
    setState(prev => ({ ...prev, pollCount: 0, lastPollTime: undefined }));
  };

  const cancelGeneration = () => {
    setState(prev => ({ 
      ...prev, 
      isCancelled: true, 
      generating: false,
      generationStatus: 'idle'
    }));
  };

  const resetGenerationState = () => {
    setState(prev => ({
      ...prev,
      generating: false,
      error: null,
      retryCount: 0,
      generationStatus: 'idle',
      generationId: undefined,
      pollCount: 0,
      lastPollTime: undefined,
      isCancelled: false
    }));
  };

  return {
    ...state,
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    incrementRetryCount,
    resetRetryCount,
    clearErrors,
    setGenerationStatus,
    setGenerationId,
    setPollingInterval,
    incrementPollCount,
    resetPollCount,
    cancelGeneration,
    resetGenerationState
  };
};
