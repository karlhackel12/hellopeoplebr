
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { generateLesson } from '@/integrations/openai/client';
import { parseLesson } from '@/integrations/openai/parser';
import { useLessonStore } from '../store/lessonStore';
import { GeneratedLessonContent } from '../types';

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
  const parseResponse = (responseData: any): GeneratedLessonContent | null => {
    updateState({ phase: 'parsing', error: null });
    try {
      const parsedContent = parseLesson(responseData);
      console.log('Parsed content:', parsedContent);
      return parsedContent;
    } catch (error) {
      console.error("Error parsing AI response:", error);
      updateState({
        phase: 'error',
        error: `Failed to process the generated content: ${error.message}`
      });
      return null;
    }
  };

  // Handle complete generation process
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    updateState({ phase: 'initializing', error: null });
    
    // Important: Use the current state rather than potentially stale state
    const currentSettings = { ...generationSettings };
    console.log('Starting generation with settings:', currentSettings);
    
    // Validate with the current settings
    if (!currentSettings.title || !currentSettings.grade) {
      console.error('Validation failed:', currentSettings);
      toast.error('Please fill in all required fields', {
        description: 'Title and proficiency level are required.'
      });
      setIsGenerating(false);
      updateState({ phase: 'idle', error: null });
      return;
    }
    
    try {
      const { title, grade, subject, additionalInstructions } = currentSettings;

      // Start the generation
      const result = await generateContent({
        title,
        grade_level: grade,
        subject,
        additional_instructions: additionalInstructions
      });

      // Handle error from API
      if (!result || !result.data) {
        handleApiError(new Error('Failed to generate content'));
        setIsGenerating(false);
        return;
      }

      // Process successful response
      const parsedContent = parseResponse(result.data);
      
      if (parsedContent) {
        // Store the structured content in the form
        updateMetadata({
          title,
          level: grade,
          language: 'English',
          timestamp: new Date().toISOString(),
          model: 'deepseek-r1'
        });
        
        // Create sections from parsed content
        const sections = {
          description: parsedContent.description,
          objectives: parsedContent.objectives,
          keyPhrases: parsedContent.keyPhrases,
          vocabulary: parsedContent.vocabulary,
          practicalSituations: parsedContent.practicalSituations,
          explanations: parsedContent.explanations,
          tips: parsedContent.tips
        };
        
        updateContent(parsedContent);
        
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
