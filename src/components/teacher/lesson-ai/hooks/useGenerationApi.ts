
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
      
      // Ensure timestamp is set
      if (!generationParams.timestamp) {
        generationParams.timestamp = new Date().toISOString();
      }

      // Ensure instructions is undefined or a string (not null or other types)
      if (generationParams.instructions !== undefined && typeof generationParams.instructions !== 'string') {
        console.warn("Instructions is not a string, converting to string:", generationParams.instructions);
        generationParams.instructions = String(generationParams.instructions);
      }
      
      // Clean params object to ensure only valid data is sent
      const cleanParams = {
        title: generationParams.title.trim(),
        level: generationParams.level,
        language: generationParams.language || 'English',
        subject: generationParams.subject || 'English',
        instructions: generationParams.instructions ? generationParams.instructions.trim() : undefined,
        timestamp: generationParams.timestamp
      };
      
      console.log("Cleaned params for edge function:", cleanParams);
      
      // Only use mock API when VITE_USE_EDGE_FUNCTIONS is explicitly set to 'false'
      if (import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'false') {
        console.log("Using mock API for lesson generation as VITE_USE_EDGE_FUNCTIONS=false");
        
        // Import the generateLesson function
        const { generateLesson } = await import('@/integrations/openai/client');
        
        // Call the mock API with the aligned parameters
        const mockResponse = await generateLesson(cleanParams);
        console.log("Mock API response:", mockResponse);
        
        // Store quiz data in local storage for later use
        if (mockResponse.quiz && mockResponse.quiz.questions) {
          try {
            const timestamp = generationParams.timestamp || new Date().toISOString();
            const storageKey = `lesson_quiz_${timestamp}`;
            
            // Save the quiz data in localStorage for later retrieval
            localStorage.setItem(
              storageKey,
              JSON.stringify(mockResponse.quiz)
            );
            console.log("Quiz data stored in localStorage with key:", storageKey);
            
            // Also store as a session reference to the most recent quiz
            localStorage.setItem('most_recent_quiz_key', storageKey);
          } catch (storageError) {
            console.warn("Failed to store quiz data:", storageError);
          }
        } else {
          console.warn("No quiz data received from mock API");
        }
        
        return {
          id: 'mock-generation',
          status: mockResponse.status as "succeeded" | "failed" | "pending" | "processing",
          lesson: mockResponse.lesson
        };
      }
      
      // For all other cases, use the edge function
      console.log("Calling Supabase edge function: generate-lesson-content");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, EDGE_FUNCTION_TIMEOUT);
      
      const { data, error } = await supabase.functions.invoke(
        'generate-lesson-content',
        {
          body: cleanParams
        }
      );
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to generate lesson content");
      }
      
      console.log("Edge function response:", data);
      
      // Store quiz data in local storage if available
      if (data.quiz && data.quiz.questions) {
        try {
          const timestamp = generationParams.timestamp || new Date().toISOString();
          const storageKey = `lesson_quiz_${timestamp}`;
          
          localStorage.setItem(
            storageKey,
            JSON.stringify(data.quiz)
          );
          console.log("Quiz data stored in localStorage with key:", storageKey);
          
          localStorage.setItem('most_recent_quiz_key', storageKey);
        } catch (storageError) {
          console.warn("Failed to store quiz data:", storageError);
        }
      }
      
      return {
        id: data.id || 'direct-generation',
        status: data.status || 'succeeded',
        lesson: data.lesson
      };
    } catch (error: any) {
      console.error("Error invoking lesson generation:", error);
      
      // Provide more specific error messages based on error type
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        toast.error("Generation timeout", {
          description: TIMEOUT_MESSAGE
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
