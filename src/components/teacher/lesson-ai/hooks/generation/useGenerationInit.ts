
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../useAIGeneration';
import { GeneratedLessonContent } from '../../types';

/**
 * Hook for handling the initialization of generation state from form data
 */
export const useGenerationInit = (
  form: UseFormReturn<LessonFormValues>,
  setGeneratedContent: (content: GeneratedLessonContent | null) => void,
  setGenerationStatus: (status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed') => void,
  setGenerationPhase: (phase: string) => void,
  setProgressPercentage: (percentage: number) => void
) => {
  // Initialize generatedContent from form's structuredContent if available
  useEffect(() => {
    const structuredContent = form.watch('structuredContent') as GeneratedLessonContent | null;
    if (structuredContent && structuredContent.description) {
      console.log('Setting generated content from form structuredContent:', structuredContent);
      setGeneratedContent(structuredContent);
      setGenerationStatus('completed');
      setGenerationPhase('complete');
      setProgressPercentage(100);
    }
  }, [form.watch('structuredContent')]);
};
