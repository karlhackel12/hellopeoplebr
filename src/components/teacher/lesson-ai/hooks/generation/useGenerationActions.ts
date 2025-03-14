
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { LessonFormValues } from '../../../lesson-editor/useLessonForm';
import { GenerationPhase } from '../types';

/**
 * Hook for handling generation actions
 */
export const useGenerationActions = (
  title: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  instructions: string,
  form: UseFormReturn<LessonFormValues>,
  setGenerating: (generating: boolean) => void,
  setGenerationStatus: (status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed') => void,
  setGenerationPhase: (phase: GenerationPhase) => void,
  setProgressPercentage: (percentage: number) => void,
  setError: (error: string | null) => void,
  generationHandler: any
) => {
  // Handle generation start
  const handleGenerate = useCallback(async () => {
    // Validate input
    if (!title || title.trim() === '') {
      toast.error('Missing title', {
        description: 'Please enter a lesson title before generating content'
      });
      return;
    }

    // Start generation
    setGenerating(true);
    setGenerationStatus('pending');
    setGenerationPhase('starting');
    setProgressPercentage(10);
    setError(null);

    // Call the generation handler
    return generationHandler.handleGenerate();
  }, [title, setGenerating, setGenerationStatus, setGenerationPhase, setProgressPercentage, setError, generationHandler]);

  // Handle generation cancellation
  const handleCancelGeneration = useCallback(async () => {
    await generationHandler.cancelGeneration();
    setGenerating(false);
    setGenerationStatus('idle');
    setGenerationPhase('idle');
    setProgressPercentage(0);
    
    toast.info('Generation cancelled', {
      description: 'Content generation was cancelled'
    });
  }, [generationHandler, setGenerating, setGenerationStatus, setGenerationPhase, setProgressPercentage]);

  // Handle generation retry
  const handleRetryGeneration = useCallback(async () => {
    setError(null);
    await generationHandler.retryGeneration();
    setGenerating(true);
    setGenerationStatus('pending');
    setGenerationPhase('starting');
    setProgressPercentage(10);
    
    toast.info('Retrying generation', {
      description: 'Attempting to generate content again'
    });
  }, [generationHandler, setError, setGenerating, setGenerationStatus, setGenerationPhase, setProgressPercentage]);

  return {
    handleGenerate,
    handleCancelGeneration,
    handleRetryGeneration
  };
};
