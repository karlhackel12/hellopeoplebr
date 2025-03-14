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

  // Get the generation handler with required methods
  const generationHandler = useGenerationHandler();

  // Function to start generation
  const handleGenerate = async () => {
    // Update settings before generating
    generationHandler.handleSettingsChange({
      title: title,
      grade: level,
      subject: 'English',
      additionalInstructions: instructions
    });
    
    await generationHandler.handleGenerate();
  };

  // Function to cancel generation
  const handleCancelGeneration = () => {
    cancelGeneration();
    generationHandler.cancelGeneration();
  };
  
  // Function to retry generation
  const handleRetryGeneration = async () => {
    // Update settings before retrying
    generationHandler.handleSettingsChange({
      title: title,
      grade: level,
      subject: 'English',
      additionalInstructions: instructions
    });
    
    await generationHandler.retryGeneration();
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
