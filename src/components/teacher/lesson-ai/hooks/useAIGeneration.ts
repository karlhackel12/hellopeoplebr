
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
    setGenerating,
    setGeneratedContent,
    setLevel,
    setInstructions,
    setError,
    clearErrors
  } = useGenerationState();

  const { handleGenerate: generateHandler } = useGenerationHandler(
    form,
    setGenerating,
    setGeneratedContent,
    setError,
    clearErrors
  );

  const handleGenerate = async () => {
    await generateHandler(title, level, instructions);
  };

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
    retryCount
  };
};
