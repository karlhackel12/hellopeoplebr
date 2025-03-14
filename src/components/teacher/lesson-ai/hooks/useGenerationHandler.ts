
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { generateLesson } from '@/integrations/openai/client';
import { parseLesson } from '@/integrations/openai/parser';
import { useLessonStore } from '../store/lessonStore';

interface GenerationSettings {
  title: string;
  grade: string;
  subject: string;
  length?: string;
  tone?: string;
  focusAreas?: string;
  additionalInstructions?: string;
}

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
    length: '',
    tone: '',
    focusAreas: '',
    additionalInstructions: ''
  });
  const { updateContent, updateMetadata } = useLessonStore();
  const [generationState, setGenerationState] = useState<GenerationState>({
    phase: 'idle',
    error: null
  });

  // Validation function
  const validate = (): boolean => {
    console.log('Validating settings:', generationSettings);
    if (!generationSettings.title) {
      toast.error('Missing title', {
        description: 'Please provide a lesson title before generating content.'
      });
      return false;
    }
    if (!generationSettings.grade) {
      toast.error('Missing level', {
        description: 'Please select an English proficiency level before generating content.'
      });
      return false;
    }
    if (!generationSettings.subject) {
      toast.error('Missing subject', {
        description: 'Subject information is required.'
      });
      return false;
    }
    return true;
  };

  // Update state function
  const updateState = useCallback((newState: Partial<GenerationState>) => {
    setGenerationState(prevState => ({ ...prevState, ...newState }));
  }, []);

  // Handle settings changes
  const handleSettingsChange = (settings: Partial<GenerationSettings>) => {
    console.log('handleSettingsChange called with:', settings);
    setGenerationSettings(prevSettings => {
      const newSettings = { ...prevSettings, ...settings };
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

  // Handle parsing errors
  const handleParsingError = (error: any) => {
    console.error('Parsing Error:', error);
    updateState({
      phase: 'error',
      error: 'Failed to parse generated content. The structure might be invalid.'
    });
    toast.error('Parsing Failed', {
      description: 'Failed to parse generated content. The structure might be invalid.'
    });
  };

  // Generate content function
  const generateContent = async (settings: any) => {
    updateState({ phase: 'generating', error: null });
    try {
      console.log('generateContent called with settings:', settings);
      const result = await generateLesson(settings);
      console.log('generateLesson result:', result);
      return result;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  };

  // Parse response function
  const parseResponse = (responseData: any) => {
    updateState({ phase: 'parsing', error: null });
    try {
      const parsedContent = parseLesson(responseData);
      return parsedContent;
    } catch (error) {
      handleParsingError(error);
      return null;
    }
  };

  // Handle complete generation process
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    updateState({ phase: 'initializing' });
    
    // Important: Use the current state rather than potentially stale state
    const currentSettings = { ...generationSettings };
    console.log('Starting generation with settings:', currentSettings);
    
    // Validate with the current settings
    if (!currentSettings.title || !currentSettings.grade || !currentSettings.subject) {
      console.error('Validation failed:', currentSettings);
      toast.error('Please fill in all required fields', {
        description: 'Title, proficiency level, and subject are required.'
      });
      setIsGenerating(false);
      updateState({ phase: 'idle', error: null });
      return;
    }
    
    try {
      const { title, grade, subject, length, tone, focusAreas, additionalInstructions } = currentSettings;

      // Start the generation
      const result = await generateContent({
        title,
        grade_level: grade,
        subject,
        length,
        tone,
        focus_areas: focusAreas,
        additional_instructions: additionalInstructions
      });

      // Handle error from API
      if (!result || !result.data) {
        handleApiError(new Error('Failed to generate content'));
        return;
      }

      // Process successful response
      await processResponse(result.data);
      
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Process the response from the API
  const processResponse = async (responseData: any) => {
    try {
      const parsedContent = parseResponse(responseData);
      
      // Fix: Check if parsedContent exists before accessing properties
      if (parsedContent && parsedContent.sections) {
        updateContent({
          sections: parsedContent.sections,
          metadata: parsedContent.metadata || {}
        });
        
        updateState({ 
          phase: 'complete', 
          error: null 
        });
      } else {
        throw new Error('Invalid content structure received');
      }
    } catch (error) {
      handleParsingError(error);
    }
  };

  return {
    isGenerating,
    generationSettings,
    generationState,
    handleSettingsChange,
    handleGenerateContent,
    // Add these functions to fix useAIGeneration.ts errors
    handleGenerate: handleGenerateContent,
    cancelGeneration: () => {
      setIsGenerating(false);
      updateState({ phase: 'idle', error: null });
    },
    retryGeneration: handleGenerateContent
  };
};
