
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useGenerationState } from './useGenerationState';
import { useGenerationHandler } from './useGenerationHandler';
import { GeneratedLessonContent } from '../types';
import { useGenerationInit } from './generation/useGenerationInit';
import { useGenerationSettings } from './generation/useGenerationSettings';
import { useGenerationActions } from './generation/useGenerationActions';
import { useGenerationCleanup } from './generation/useGenerationCleanup';

// Import the LessonFormValues type from useLessonForm.ts
import { LessonFormValues } from '../../lesson-editor/useLessonForm';

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

  // Initialize content from form data if available
  useGenerationInit(
    form, 
    setGeneratedContent, 
    setGenerationStatus, 
    setGenerationPhase, 
    setProgressPercentage
  );

  // Get the generation handler with required methods
  const generationHandler = useGenerationHandler();
  
  // Synchronize settings with the generation handler
  useGenerationSettings(
    title, 
    level, 
    instructions, 
    generationHandler.handleSettingsChange
  );

  // Set up generation actions
  const { 
    handleGenerate, 
    handleCancelGeneration, 
    handleRetryGeneration 
  } = useGenerationActions(
    title,
    level,
    instructions,
    form,
    setGenerating,
    setGenerationStatus,
    setGenerationPhase,
    setProgressPercentage,
    setError,
    generationHandler
  );

  // Cleanup resources on unmount
  useGenerationCleanup(generating, cancelGeneration);

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
