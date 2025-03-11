
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GenerationParams } from './types';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { useContentUpdater } from './useContentUpdater';

const MAX_RETRY_ATTEMPTS = 3;
const MAX_POLL_COUNT = 20;
const POLL_INTERVAL_MS = 3000;

export const useGenerationHandler = (
  form: UseFormReturn<LessonFormValues>,
  setGenerating: (value: boolean) => void,
  setGeneratedContent: (content: any) => void,
  setError: (error: string | null) => void,
  clearErrors: () => void,
  setGenerationStatus: (status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed') => void,
  setGenerationId: (id: string | undefined) => void
) => {
  const { invokeLessonGeneration, checkPredictionStatus } = useGenerationApi();
  const { parseAIResponse } = useResponseParser();
  const { updateFormContent } = useContentUpdater(form);

  const validateTitleInput = (title: string): boolean => {
    if (!title.trim()) {
      toast.error("Title required", {
        description: "Please provide a lesson title before generating content",
      });
      setGenerating(false);
      setGenerationStatus('failed');
      return false;
    }
    return true;
  };

  const pollForCompletion = async (
    predictionId: string, 
    generationParams: GenerationParams,
    title: string,
    pollCount = 0
  ): Promise<void> => {
    // Give up after too many attempts
    if (pollCount >= MAX_POLL_COUNT) {
      setGenerating(false);
      setGenerationStatus('failed');
      setError("Generation timed out. Please try again later.");
      toast.error("Generation timeout", {
        description: "The content generation process took too long. Please try again.",
      });
      return;
    }

    try {
      // Check the current status
      const statusResponse = await checkPredictionStatus(predictionId);
      console.log(`Poll attempt ${pollCount}: Status = ${statusResponse.status}`);

      if (statusResponse.status === 'succeeded' && statusResponse.output) {
        // Generation completed successfully
        try {
          // Parse the AI response
          const parsedContent = parseAIResponse(statusResponse.output);
          setGeneratedContent(parsedContent);
          updateFormContent(parsedContent, title, generationParams);
          
          toast.success("Content generated", {
            description: "AI-generated English lesson content is ready for review",
          });
          
          setGenerating(false);
          setGenerationStatus('completed');
        } catch (parseError: any) {
          console.error("Error parsing AI response:", parseError);
          console.log("Problem with output:", statusResponse.output);
          
          setError(`Failed to process the generated content: ${parseError.message}`);
          setGenerating(false);
          setGenerationStatus('failed');
          
          toast.error("Processing error", {
            description: "Failed to process the generated content. Check console for details.",
          });
        }
      } else if (statusResponse.status === 'failed') {
        // Generation failed
        setError("The content generation process failed. Please try again.");
        setGenerating(false);
        setGenerationStatus('failed');
        
        toast.error("Generation failed", {
          description: "The AI model failed to generate content. Please try again.",
        });
      } else {
        // Still processing, schedule another check
        setTimeout(() => {
          pollForCompletion(predictionId, generationParams, title, pollCount + 1);
        }, POLL_INTERVAL_MS);
      }
    } catch (pollError: any) {
      console.error("Error polling for generation status:", pollError);
      
      setError(`Error checking generation status: ${pollError.message}`);
      setGenerating(false);
      setGenerationStatus('failed');
      
      toast.error("Status check failed", {
        description: "Failed to check generation status. Please try again.",
      });
    }
  };

  const handleGenerate = async (
    title: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    instructions: string,
    retryAttempt = 0
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
        toast.info("Content generation started", {
          description: "AI is working on your lesson content. This may take a minute...",
        });
        
        // Start the generation process
        const response = await invokeLessonGeneration(generationParams);
        
        if (response.status === "succeeded" && response.output) {
          // If we got an immediate response
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
            setError(`Failed to process the generated content: ${parseError.message}`);
            setGenerating(false);
            setGenerationStatus('failed');
            
            toast.error("Processing error", {
              description: "Failed to process the generated content. Check console for details.",
            });
          }
        } else if (response.status === "pending" || response.status === "processing") {
          // If the process is running asynchronously
          setGenerationStatus('processing');
          setGenerationId(response.id);
          
          toast.info("Generation in progress", {
            description: "Your content is being generated. This may take a minute...",
          });
          
          // Begin polling for completion
          pollForCompletion(response.id, generationParams, title);
        } else {
          throw new Error("Failed to start generation process");
        }
      } catch (invokeError: any) {
        console.error("Error generating lesson content:", invokeError);
        
        // Try again for specific errors, up to MAX_RETRY_ATTEMPTS
        if (retryAttempt < MAX_RETRY_ATTEMPTS) {
          console.log(`Retrying generation (attempt ${retryAttempt + 1} of ${MAX_RETRY_ATTEMPTS})`);
          
          toast.info("Retrying generation", {
            description: "Encountered an issue, retrying the generation process...",
          });
          
          // Wait a moment before retrying
          setTimeout(() => {
            handleGenerate(title, level, instructions, retryAttempt + 1);
          }, 1000);
          
          return;
        }
        
        // Handle specific error cases
        const errorMessage = invokeError?.message || "Failed to call the generation service";
        setError(errorMessage);
        setGenerating(false);
        setGenerationStatus('failed');
        
        toast.error("Generation failed", {
          description: "Failed to call the AI generation service. Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("Error generating lesson content:", error);
      setError(error?.message || "Unknown error");
      setGenerating(false);
      setGenerationStatus('failed');
      
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
    }
  };

  return {
    handleGenerate
  };
};
