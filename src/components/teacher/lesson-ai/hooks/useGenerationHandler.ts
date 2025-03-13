
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GenerationParams } from './types';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { useContentUpdater } from './useContentUpdater';
import { useValidation } from './useValidation';
import { useErrorHandler } from './useErrorHandler';
import { useGenerationProcess } from './useGenerationProcess';

export const useGenerationHandler = (
  form: UseFormReturn<LessonFormValues>,
  generationState: any,
  updateState: any
) => {
  const { invokeLessonGeneration } = useGenerationApi();
  const { parseAIResponse } = useResponseParser();
  const { updateFormContent } = useContentUpdater(form);
  
  const {
    setGenerating,
    setGeneratedContent,
    setError,
    clearErrors,
    setGenerationStatus,
    resetGenerationState
  } = updateState;

  // Use our new focused hooks
  const { validateTitleInput } = useValidation(setGenerating, setGenerationStatus);
  const { handleGenerationError, handleParsingError } = useErrorHandler(setError, setGenerating, setGenerationStatus);
  const { processGeneration } = useGenerationProcess(
    invokeLessonGeneration, 
    parseAIResponse, 
    updateFormContent, 
    setGeneratedContent, 
    handleParsingError
  );

  const handleGenerate = async (
    title: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    instructions: string
  ) => {
    try {
      clearErrors();
      setGenerating(true);
      setGenerationStatus('pending');
      
      if (!validateTitleInput(title)) {
        return;
      }
      
      const generationParams: GenerationParams = {
        timestamp: new Date().toISOString(),
        title,
        level,
        language: 'english',
        instructions: instructions.trim() || undefined,
      };
      
      try {
        await processGeneration(generationParams);
        setGenerating(false);
        setGenerationStatus('completed');
      } catch (error: any) {
        handleGenerationError(error);
      }
    } catch (error: any) {
      console.error("Error in handleGenerate:", error);
      setError(error?.message || "Unknown error");
      setGenerating(false);
      setGenerationStatus('failed');
      
      toast.error("Generation failed", {
        description: error?.message || "An unexpected error occurred",
      });
    }
  };

  const cancelGeneration = () => {
    resetGenerationState();
    toast.info("Generation cancelled", {
      description: "The lesson generation process has been cancelled.",
    });
  };

  return {
    handleGenerate,
    cancelGeneration
  };
};
