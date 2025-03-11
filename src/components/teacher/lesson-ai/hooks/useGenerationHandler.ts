
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GenerationParams } from './types';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { useContentUpdater } from './useContentUpdater';

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

  const validateTitleInput = (title: string): boolean => {
    if (!title?.trim()) {
      toast.error("Title required", {
        description: "Please provide a lesson title before generating content",
      });
      setGenerating(false);
      setGenerationStatus('failed');
      return false;
    }
    return true;
  };

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
      
      toast.info("Content generation started", {
        description: "AI is working on your lesson content. This may take a minute...",
      });
      
      try {
        const response = await invokeLessonGeneration(generationParams);
        
        if (response.status === "succeeded" && response.output) {
          try {
            const parsedContent = parseAIResponse(response.output);
            setGeneratedContent(parsedContent);
            updateFormContent(parsedContent, title, generationParams);
            
            toast.success("Content generated", {
              description: "AI-generated English lesson content is ready for review",
            });
            
            setGenerating(false);
            setGenerationStatus('completed');
          } catch (parseError: any) {
            console.error("Error parsing AI response:", parseError);
            throw new Error(`Failed to process the generated content: ${parseError.message}`);
          }
        } else {
          throw new Error("Failed to generate content");
        }
      } catch (error: any) {
        console.error("Error generating lesson content:", error);
        setError(error?.message || "Failed to generate content");
        setGenerating(false);
        setGenerationStatus('failed');
        
        toast.error("Generation failed", {
          description: error?.message || "Failed to generate lesson content",
        });
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
