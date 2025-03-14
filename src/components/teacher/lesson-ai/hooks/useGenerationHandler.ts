
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useLessonStore } from '../store/lessonStore';
import { GeneratedLessonContent } from '../types';
import { generateContent } from './utils/apiUtils';
import { parseResponse } from './utils/parserUtils';
import { GenerationSettings, validateGenerationSettings } from './utils/validationUtils';

interface GenerationState {
  phase: 'idle' | 'initializing' | 'generating' | 'parsing' | 'complete' | 'error';
  error: string | null;
}

export const useGenerationHandler = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    title: '',
    grade: 'beginner',
    subject: 'English',
    language: 'English',
    timestamp: new Date().toISOString(),
    additionalInstructions: ''
  });
  const { updateContent, updateMetadata } = useLessonStore();
  const [generationState, setGenerationState] = useState<GenerationState>({
    phase: 'idle',
    error: null
  });

  // Update state function
  const updateState = useCallback((newState: Partial<GenerationState>) => {
    setGenerationState(prevState => ({ ...prevState, ...newState }));
  }, []);

  // Handle settings changes
  const handleSettingsChange = (settings: Partial<GenerationSettings>) => {
    console.log('handleSettingsChange called with:', settings);
    setGenerationSettings(prevSettings => {
      const newSettings = { 
        ...prevSettings, 
        ...settings,
        timestamp: settings.timestamp || prevSettings.timestamp || new Date().toISOString()
      };
      console.log('Updated generation settings:', newSettings);
      return newSettings;
    });
  };

  // Handle API errors
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    updateState({
      phase: 'error',
      error: 'Failed to generate content. Please check your settings and try again.'
    });
    toast.error('Generation Failed', {
      description: 'Failed to generate content. Please check your settings and try again.'
    });
  };

  // Handle complete generation process
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    updateState({ phase: 'initializing', error: null });
    
    // Important: Use the current state rather than potentially stale state
    const currentSettings = { ...generationSettings };
    console.log('Starting generation with settings:', currentSettings);
    
    // Validate with the current settings
    if (!validateGenerationSettings(currentSettings)) {
      console.error('Validation failed:', currentSettings);
      setIsGenerating(false);
      updateState({ phase: 'idle', error: null });
      return;
    }
    
    try {
      const { title, grade, subject, language, timestamp, additionalInstructions } = currentSettings;

      // Start the generation
      updateState({ phase: 'generating', error: null });
      const result = await generateContent({
        title,
        grade_level: grade,
        subject,
        language,
        timestamp,
        additional_instructions: additionalInstructions
      });

      // Handle error from API
      if (!result) {
        handleApiError(new Error('Failed to generate content'));
        setIsGenerating(false);
        return;
      }

      // Process successful response
      updateState({ phase: 'parsing', error: null });
      const parsedContent = parseResponse(result);
      
      if (parsedContent) {
        // Store the structured content in the form
        updateMetadata({
          title,
          level: grade,
          language: language || 'English',
          timestamp: timestamp,
          model: 'deepseek-r1',
          status: result.status || 'succeeded',
          completed: new Date().toISOString()
        });
        
        updateContent(parsedContent as any);
        
        updateState({ 
          phase: 'complete', 
          error: null 
        });
        
        toast.success('Content Generated', {
          description: 'Your lesson content has been successfully generated'
        });
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Generation error:', error);
      handleApiError(error);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generationSettings,
    generationState,
    handleSettingsChange,
    handleGenerate: handleGenerateContent,
    cancelGeneration: () => {
      setIsGenerating(false);
      updateState({ phase: 'idle', error: null });
    },
    retryGeneration: handleGenerateContent
  };
};
