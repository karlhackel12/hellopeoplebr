
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { useGenerationState } from './useGenerationState';
import { useGenerationHandler } from './useGenerationHandler';

export const useAIGeneration = (form: UseFormReturn<LessonFormValues>, title: string) => {
  // Get all generation state and state updaters
  const generationState = useGenerationState();
  
  const {
    generating,
    generatedContent,
    level,
    instructions,
    error,
    retryCount,
    generationStatus,
    generationId,
    pollingInterval,
    pollCount,
    maxPollCount,
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationId,
    resetGenerationState,
    cancelGeneration
  } = generationState;

  // Create the state updater object
  const stateUpdaters = {
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationId,
    incrementPollCount: generationState.incrementPollCount,
    resetPollCount: generationState.resetPollCount,
    incrementRetryCount: generationState.incrementRetryCount,
    resetRetryCount: generationState.resetRetryCount
  };

  // Get the generation handler
  const { handleGenerate: generateHandler, cancelGeneration: cancelGenerationHandler } = useGenerationHandler(
    form,
    generationState,
    stateUpdaters
  );

  // Function to start generation
  const handleGenerate = async () => {
    await generateHandler(title, level, instructions);
  };

  // Function to cancel generation
  const handleCancelGeneration = () => {
    cancelGeneration();
    cancelGenerationHandler();
  };

  // Clean up any polling or resources when component unmounts
  useEffect(() => {
    return () => {
      if (generating) {
        cancelGeneration();
      }
    };
  }, [generating]);

  return {
    generating,
    generatedContent,
    level,
    setLevel,
    instructions,
    setInstructions,
    handleGenerate,
    handleCancelGeneration,
    error,
    clearErrors,
    retryCount,
    generationStatus,
    generationId,
    pollCount,
    maxPollCount,
    progress: Math.min(Math.floor((pollCount / maxPollCount) * 100), 95) // Cap at 95% until complete
  };
};
