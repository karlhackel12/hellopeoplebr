
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { useGenerationState } from './useGenerationState';
import { useGenerationHandler } from './useGenerationHandler';

export const useAIGeneration = (form: UseFormReturn<LessonFormValues>, title: string) => {
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
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationId,
    setPollingInterval
  } = useGenerationState();

  const { handleGenerate: generateHandler } = useGenerationHandler(
    form,
    setGenerating,
    setGeneratedContent,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationId
  );

  const handleGenerate = async () => {
    await generateHandler(title, level, instructions);
  };

  // Clean up any polling or resources when component unmounts
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

  return {
    generating,
    generatedContent,
    level,
    setLevel,
    instructions,
    setInstructions,
    handleGenerate,
    error,
    clearErrors,
    retryCount,
    generationStatus,
    generationId
  };
};
