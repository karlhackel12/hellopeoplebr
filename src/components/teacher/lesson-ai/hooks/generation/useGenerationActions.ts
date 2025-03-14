
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '@/components/teacher/lesson-editor/useLessonForm';

/**
 * Hook for handling generation actions like start, cancel, and retry
 */
export const useGenerationActions = (
  title: string, 
  level: 'beginner' | 'intermediate' | 'advanced',
  instructions: string,
  form: UseFormReturn<LessonFormValues>,
  setGenerating: (generating: boolean) => void,
  setGenerationStatus: (status: string) => void,
  setGenerationPhase: (phase: string) => void,
  setProgressPercentage: (percentage: number) => void,
  setError: (error: string | null) => void,
  generationHandler: any
) => {
  // Function to start generation with proper sequence
  const handleGenerate = async () => {
    // Check if title is valid first
    if (!title?.trim()) {
      setError('Please provide a lesson title before generating content');
      return;
    }

    setGenerating(true);
    setGenerationStatus('pending');
    setGenerationPhase('starting');
    setProgressPercentage(10);
    setError(null);
    
    try {
      // Generate a new timestamp for this generation
      const timestamp = new Date().toISOString();
      
      // First update settings with current values
      generationHandler.handleSettingsChange({
        title: title,
        grade: level,
        subject: 'English',
        language: 'English',
        timestamp: timestamp,
        additionalInstructions: instructions
      });
      
      // Then start generation
      console.log('Starting generation for:', {
        title,
        level,
        instructions,
        timestamp
      });
      
      // Update phase to generate
      setGenerationPhase('generating');
      setProgressPercentage(30);
      
      const result = await generationHandler.handleGenerate();
      
      // If we get here, the generation was successful
      setGenerationPhase('complete');
      setProgressPercentage(100);
      setGenerationStatus('completed');
      
      // Update form with generated content (this should be done by the handler)
      const structuredContent = form.watch('structuredContent');
      if (structuredContent) {
        // Let the parent hook handle this
      }
      
    } catch (error) {
      console.error('Generation error:', error);
      setError(error.message || 'An error occurred during generation');
      setGenerationStatus('failed');
      setGenerationPhase('error');
      setGenerating(false);
    }
  };

  // Function to cancel generation
  const handleCancelGeneration = () => {
    generationHandler.cancelGeneration();
  };
  
  // Function to retry generation
  const handleRetryGeneration = async () => {
    setGenerating(true);
    setGenerationStatus('pending');
    setError(null);
    
    try {
      // Update settings before retrying
      const timestamp = new Date().toISOString();
      generationHandler.handleSettingsChange({
        title: title,
        grade: level,
        subject: 'English',
        language: 'English',
        timestamp: timestamp,
        additionalInstructions: instructions
      });
      
      await generationHandler.retryGeneration();
    } catch (error) {
      console.error('Retry error:', error);
      setError(error.message || 'An error occurred during retry');
      setGenerationStatus('failed');
      setGenerating(false);
    }
  };

  return {
    handleGenerate,
    handleCancelGeneration,
    handleRetryGeneration
  };
};
