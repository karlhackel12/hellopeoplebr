
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
      // Validate params before sending
      if (!generationParams.title) {
        throw new Error("Title is required for lesson generation");
      }

      // Ensure instructions is undefined or a string (not null or other types)
      if (generationParams.instructions !== undefined && typeof generationParams.instructions !== 'string') {
        console.warn("Instructions is not a string, converting to string:", generationParams.instructions);
        generationParams.instructions = String(generationParams.instructions);
      }
      
      // Clean params object to ensure only valid data is sent
      const cleanParams = {
        ...generationParams,
        title: generationParams.title.trim(),
        level: generationParams.level,
        language: generationParams.language,
        instructions: generationParams.instructions ? generationParams.instructions.trim() : undefined,
        timestamp: generationParams.timestamp
      };
      
      console.log("Cleaned params for edge function:", cleanParams);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(TIMEOUT_MESSAGE));
        }, EDGE_FUNCTION_TIMEOUT);
      });

      // Create the actual request promise with explicit function name
      console.log("Calling Supabase edge function: generate-lesson-content");
      const edgeFunctionPromise = supabase.functions.invoke('generate-lesson-content', {
        body: cleanParams,
      });
      
      // Race the promises - whichever resolves/rejects first wins
      const response = await Promise.race([edgeFunctionPromise, timeoutPromise]);
      
      console.log("Edge function response received:", response);
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error?.message || "Failed to start content generation");
      }

      const resultData = response.data;
      console.log("Edge function response data:", resultData);
      
      // Store quiz data in local storage for later use
      if (resultData.quiz && resultData.quiz.questions) {
        try {
          const timestamp = generationParams.timestamp || new Date().toISOString();
          const storageKey = `lesson_quiz_${timestamp}`;
          
          // Save the quiz data in localStorage for later retrieval
          localStorage.setItem(
            storageKey,
            JSON.stringify(resultData.quiz)
          );
          console.log("Quiz data stored in localStorage with key:", storageKey);
          
          // Also store as a session reference to the most recent quiz
          localStorage.setItem('most_recent_quiz_key', storageKey);
        } catch (storageError) {
          console.warn("Failed to store quiz data:", storageError);
        }
      } else {
        console.warn("No quiz data received from edge function");
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
