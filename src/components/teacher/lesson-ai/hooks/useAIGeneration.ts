
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { useGenerationState } from './useGenerationState';
import { useGenerationHandler } from './useGenerationHandler';
import { GeneratedLessonContent } from '../types';

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
    generationPhase,
    progressPercentage,
    statusMessage,
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
    setGenerationPhase,
    setProgressPercentage,
    setStatusMessage,
    setGenerationId,
    resetGenerationState,
    cancelGeneration
  } = generationState;

  // Initialize generatedContent from form's structuredContent if available
  useEffect(() => {
    const structuredContent = form.watch('structuredContent') as GeneratedLessonContent | null;
    if (structuredContent && !generatedContent) {
      setGeneratedContent(structuredContent);
      setGenerationStatus('completed');
      setGenerationPhase('complete');
      setProgressPercentage(100);
    }
  }, [form.watch('structuredContent')]);

  // Keep generatedContent in sync with form's structuredContent
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'structuredContent') {
        const newContent = value.structuredContent as GeneratedLessonContent | null;
        if (newContent) {
          setGeneratedContent(newContent);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Create the state updater object
  const stateUpdaters = {
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationPhase,
    setProgressPercentage,
    setStatusMessage,
    setGenerationId,
    incrementPollCount: generationState.incrementPollCount,
    resetPollCount: generationState.resetPollCount,
    incrementRetryCount: generationState.incrementRetryCount,
    resetRetryCount: generationState.resetRetryCount,
    resetGenerationState
  };

  // Get the generation handler
  const { 
    handleGenerate: generateHandler, 
    cancelGeneration: cancelGenerationHandler,
    retryGeneration: retryGenerationHandler
  } = useGenerationHandler(
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
  
  // Function to retry generation
  const handleRetryGeneration = async () => {
    await retryGenerationHandler(title, level, instructions);
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
    handleRetryGeneration,
    error,
    clearErrors,
    retryCount,
    generationStatus,
    generationPhase,
    progressPercentage,
    statusMessage,
    generationId,
    pollCount,
    maxPollCount
  };
};
