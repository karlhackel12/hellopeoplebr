
import { useState } from 'react';
import { GeneratedLessonContent } from '../types';
import { GenerationState, GenerationPhase } from './types';

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
    generationPhase: 'idle',
    progressPercentage: 0,
    statusMessage: '',
    isCancelled: false,
    // Add the missing properties with their default values
    generationId: undefined,
    pollingInterval: DEFAULT_POLLING_INTERVAL,
    pollCount: 0,
    maxPollCount: MAX_POLL_COUNT,
    lastPollTime: undefined
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
    setState(prev => ({ 
      ...prev, 
      error,
      generationPhase: error ? 'error' : prev.generationPhase 
    }));
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
    
    // Update phase based on status
    if (status === 'pending') {
      setGenerationPhase('starting');
      setProgressPercentage(10);
    } else if (status === 'processing') {
      setGenerationPhase('generating');
      setProgressPercentage(40);
    } else if (status === 'completed') {
      setGenerationPhase('complete');
      setProgressPercentage(100);
    } else if (status === 'failed') {
      setGenerationPhase('error');
    }
  };

  const setGenerationPhase = (phase: GenerationPhase) => {
    setState(prev => ({ ...prev, generationPhase: phase }));
    
    // Set appropriate status message based on phase
    let message = '';
    switch (phase) {
      case 'starting':
        message = 'Initializing AI lesson generation...';
        break;
      case 'analyzing':
        message = 'Analyzing topic and requirements...';
        break;
      case 'generating':
        message = 'Creating lesson content with AI...';
        break;
      case 'processing':
        message = 'Processing and formatting content...';
        break;
      case 'complete':
        message = 'Lesson content successfully generated!';
        break;
      case 'error':
        message = 'There was an error generating content.';
        break;
      default:
        message = '';
    }
    
    setStatusMessage(message);
  };

  const setProgressPercentage = (percentage: number) => {
    setState(prev => ({ ...prev, progressPercentage: percentage }));
  };

  const setStatusMessage = (message: string) => {
    setState(prev => ({ ...prev, statusMessage: message }));
  };

  const setGenerationId = (id: string | undefined) => {
    setState(prev => ({ ...prev, generationId: id }));
  };

  const setPollingInterval = (interval: number) => {
    setState(prev => ({ ...prev, pollingInterval: interval }));
  };

  const incrementPollCount = () => {
    setState(prev => {
      const newPollCount = prev.pollCount + 1;
      // Calculate progress based on poll count (25% to 90%)
      const pollProgress = Math.min(25 + (newPollCount / prev.maxPollCount) * 65, 90);
      
      return { 
        ...prev, 
        pollCount: newPollCount, 
        lastPollTime: Date.now(),
        progressPercentage: prev.generationPhase === 'complete' ? 100 : pollProgress
      };
    });
  };

  const resetPollCount = () => {
    setState(prev => ({ ...prev, pollCount: 0, lastPollTime: undefined }));
  };

  const cancelGeneration = () => {
    setState(prev => ({ 
      ...prev, 
      isCancelled: true, 
      generating: false,
      generationStatus: 'idle',
      generationPhase: 'idle',
      progressPercentage: 0,
      statusMessage: 'Generation cancelled'
    }));
  };

  const resetGenerationState = () => {
    setState(prev => ({
      ...prev,
      generating: false,
      error: null,
      retryCount: 0,
      generationStatus: 'idle',
      generationPhase: 'idle',
      progressPercentage: 0,
      statusMessage: '',
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
    setGenerationPhase,
    setProgressPercentage,
    setStatusMessage,
    setGenerationId,
    setPollingInterval,
    incrementPollCount,
    resetPollCount,
    cancelGeneration,
    resetGenerationState
  };
};
