
import { useState } from 'react';
import { GeneratedLessonContent } from '../types';
import { GenerationState } from './types';

export const useGenerationState = () => {
  const [state, setState] = useState<GenerationState>({
    generating: false,
    generatedContent: null,
    level: 'beginner',
    instructions: '',
    error: null,
    retryCount: 0
  });

  const setGenerating = (generating: boolean) => {
    setState(prev => ({ ...prev, generating }));
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

  const clearErrors = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    incrementRetryCount,
    clearErrors
  };
};
