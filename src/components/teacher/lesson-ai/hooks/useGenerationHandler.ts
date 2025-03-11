
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GenerationParams } from './types';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { useContentUpdater } from './useContentUpdater';

export const useGenerationHandler = (
  form: UseFormReturn<LessonFormValues>,
  setGenerating: (value: boolean) => void,
  setGeneratedContent: (content: any) => void,
  setError: (error: string | null) => void,
  clearErrors: () => void
) => {
  const { invokeLessonGeneration } = useGenerationApi();
  const { parseAIResponse } = useResponseParser();
  const { updateFormContent } = useContentUpdater(form);

  const validateTitleInput = (title: string): boolean => {
    if (!title.trim()) {
      toast.error("Title required", {
        description: "Please provide a lesson title before generating content",
      });
      setGenerating(false);
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
        toast.info("Content generation started", {
          description: "AI is working on your lesson content. This may take a minute...",
        });
        
        // Get the direct response from the edge function
        const response = await invokeLessonGeneration(generationParams);
        
        if (response.status === "succeeded" && response.output) {
          try {
            // Parse the AI response
            const parsedContent = parseAIResponse(response.output);
            setGeneratedContent(parsedContent);
            
            updateFormContent(parsedContent, title, generationParams);
            
            toast.success("Content generated", {
              description: "AI-generated English lesson content is ready for review",
            });
            setGenerating(false);
          } catch (parseError: any) {
            console.error("Error parsing AI response:", parseError);
            console.log("Problem with output:", response.output);
            setError(`Failed to process the generated content: ${parseError.message}`);
            toast.error("Processing error", {
              description: "Failed to process the generated content. Check console for details.",
            });
            setGenerating(false);
          }
        } else {
          throw new Error("Failed to generate content");
        }
      } catch (invokeError: any) {
        console.error("Error generating lesson content:", invokeError);
        
        // Handle specific error cases
        const errorMessage = invokeError?.message || "Failed to call the generation service";
        setError(errorMessage);
        
        toast.error("Generation failed", {
          description: "Failed to call the AI generation service. Please try again later.",
        });
        
        setGenerating(false);
      }
    } catch (error: any) {
      console.error("Error generating lesson content:", error);
      setError(error?.message || "Unknown error");
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
      setGenerating(false);
    }
  };

  return {
    handleGenerate
  };
};
