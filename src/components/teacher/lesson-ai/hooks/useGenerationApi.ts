
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenerationParams, PredictionResponse } from './types';

// Define timeout constants
const EDGE_FUNCTION_TIMEOUT = 90000; // 90 seconds
const TIMEOUT_MESSAGE = "Generation is taking longer than expected. This might be due to high server load.";

export const useGenerationApi = () => {
  const invokeLessonGeneration = async (generationParams: GenerationParams): Promise<PredictionResponse> => {
    console.log("Invoking generate-lesson-content function with params:", generationParams);
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(TIMEOUT_MESSAGE));
        }, EDGE_FUNCTION_TIMEOUT);
      });

      // Create the actual request promise with explicit function name
      console.log("Calling Supabase edge function: generate-lesson-content");
      const edgeFunctionPromise = supabase.functions.invoke('generate-lesson-content', {
        body: generationParams,
      });
      
      // Race the promises - whichever resolves/rejects first wins
      const response = await Promise.race([edgeFunctionPromise, timeoutPromise]);
      
      console.log("Edge function response status:", response.status);
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error?.message || "Failed to start content generation");
      }

      const resultData = response.data;
      console.log("Edge function response data:", resultData);
      
      // Store quiz data in local storage for later use
      if (resultData.quiz && resultData.quiz.questions) {
        try {
          // Save the quiz data in localStorage for later retrieval
          localStorage.setItem(
            `lesson_quiz_${generationParams.timestamp || new Date().toISOString()}`,
            JSON.stringify(resultData.quiz)
          );
          console.log("Quiz data stored for later use");
        } catch (storageError) {
          console.warn("Failed to store quiz data:", storageError);
        }
      }
      
      return {
        id: 'direct',
        status: resultData.status || 'succeeded',
        output: resultData.lesson || resultData.output
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      
      // Provide more specific error messages based on error type
      if (error.message === TIMEOUT_MESSAGE) {
        toast.error("Generation timeout", {
          description: "The AI is still working, but it's taking longer than expected. Try refreshing the page in a few moments to see if content has been generated."
        });
      } else if (error.message?.includes("Failed to fetch") || error.code === "NETWORK_ERROR") {
        toast.error("Network error", {
          description: "There was a problem connecting to our servers. Please check your internet connection and try again."
        });
      } else if (error.status === 404 || error.message?.includes("404")) {
        toast.error("Edge function not found", {
          description: "The AI generation service may not be deployed correctly. Please contact support."
        });
      } else if (error.status === 403) {
        toast.error("Permission denied", {
          description: "You don't have permission to use this feature. Please check your account status."
        });
      } else {
        toast.error("Generation failed", {
          description: error.message || "An unexpected error occurred while generating content."
        });
      }
      
      throw error;
    }
  };

  return {
    invokeLessonGeneration
  };
};
