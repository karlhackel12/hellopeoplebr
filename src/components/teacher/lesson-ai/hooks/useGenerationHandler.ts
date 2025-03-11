
import { toast } from 'sonner';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { GenerationParams } from './types';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { useContentUpdater } from './useContentUpdater';

// Constants
const MAX_RETRY_ATTEMPTS = 2;

export const useGenerationHandler = (
  form: UseFormReturn<LessonFormValues>,
  generationState: any,
  updateState: any
) => {
  const { invokeLessonGeneration, checkPredictionStatus } = useGenerationApi();
  const { parseAIResponse } = useResponseParser();
  const { updateFormContent } = useContentUpdater(form);
  
  // Destructure state and state updaters for cleaner code
  const {
    setGenerating,
    setGeneratedContent,
    setError,
    clearErrors,
    setGenerationStatus,
    setGenerationId,
    incrementPollCount,
    resetPollCount,
    incrementRetryCount,
    resetRetryCount
  } = updateState;

  const {
    pollingInterval,
    pollCount,
    maxPollCount,
    isCancelled
  } = generationState;

  // Function to validate the title input
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

  // Function to poll for the completion of a generation process
  const pollForCompletion = async (
    predictionId: string, 
    generationParams: GenerationParams,
    title: string
  ): Promise<void> => {
    // If generation was cancelled, stop polling
    if (isCancelled) {
      console.log("Generation cancelled, stopping polling");
      return;
    }

    // If we've exceeded the maximum poll count, give up
    if (pollCount >= maxPollCount) {
      setGenerating(false);
      setGenerationStatus('failed');
      setError("Generation timed out. Please try again later.");
      toast.error("Generation timeout", {
        description: "The content generation process took too long. Please try again.",
      });
      return;
    }

    try {
      // Increment the poll count
      incrementPollCount();
      console.log(`Poll attempt ${pollCount + 1}/${maxPollCount}`);
      
      // Check the current status
      const statusResponse = await checkPredictionStatus(predictionId);
      console.log(`Status check result: ${statusResponse.status}`);

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
          
          // Reset states
          setGenerating(false);
          setGenerationStatus('completed');
          resetPollCount();
          
          console.log("Generation completed successfully");
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
        resetPollCount();
        
        toast.error("Generation failed", {
          description: "The AI model failed to generate content. Please try again.",
        });
      } else {
        // Still processing, schedule another check after the polling interval
        setTimeout(() => {
          pollForCompletion(predictionId, generationParams, title);
        }, pollingInterval);
      }
    } catch (pollError: any) {
      console.error("Error polling for generation status:", pollError);
      
      // If we get an error while polling, try again after a delay (unless we've exceeded the max poll count)
      if (pollCount < maxPollCount - 1) {
        setTimeout(() => {
          pollForCompletion(predictionId, generationParams, title);
        }, pollingInterval * 2); // Use a longer delay after an error
      } else {
        setError(`Error checking generation status: ${pollError.message}`);
        setGenerating(false);
        setGenerationStatus('failed');
        resetPollCount();
        
        toast.error("Status check failed", {
          description: "Failed to check generation status. Please try again.",
        });
      }
    }
  };

  // Main function to handle the generation process
  const handleGenerate = async (
    title: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    instructions: string
  ) => {
    try {
      // Reset error state
      clearErrors();
      
      // Set generating state to true
      setGenerating(true);
      setGenerationStatus('pending');
      resetRetryCount();
      resetPollCount();
      
      // Validate input
      if (!validateTitleInput(title)) {
        return;
      }
      
      // Prepare generation parameters
      const generationParams: GenerationParams = {
        timestamp: new Date().toISOString(),
        title,
        level,
        language: 'english',
        instructions: instructions.trim() || undefined,
      };
      
      // Show toast to indicate generation has started
      toast.info("Content generation started", {
        description: "AI is working on your lesson content. This may take a minute...",
      });
      
      try {
        // Start the generation process
        const response = await invokeLessonGeneration(generationParams);
        console.log("Generation response:", response);
        
        if (response.status === "succeeded" && response.output) {
          // If we got an immediate response with output
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
      console.error("Error in handleGenerate:", error);
      setError(error?.message || "Unknown error");
      setGenerating(false);
      setGenerationStatus('failed');
      
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
    }
  };

  // Function to cancel an ongoing generation
  const cancelGeneration = async () => {
    if (generationState.generationId) {
      console.log("Cancelling generation:", generationState.generationId);
      // We would implement actual cancellation here if the API supported it
      // For now, just update the UI state
      toast.info("Generation cancelled", {
        description: "The lesson generation process has been cancelled.",
      });
    }
    
    // Reset all generation-related state
    setGenerating(false);
    setGenerationStatus('idle');
    resetPollCount();
    setGenerationId(undefined);
  };

  return {
    handleGenerate,
    cancelGeneration
  };
};
