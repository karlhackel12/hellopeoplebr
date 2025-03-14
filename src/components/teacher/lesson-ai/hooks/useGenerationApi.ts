
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
      
      // Use our mock API instead of real API call
      console.log("Using mock API for lesson generation");
      
      // Import the generateLesson function
      const { generateLesson } = await import('@/integrations/openai/client');
      
      // Call the mock API
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
        status: mockResponse.status || 'succeeded',
        lesson: mockResponse.lesson
      };
    } catch (error: any) {
      console.error("Error invoking mock API:", error);
      
      // Provide more specific error messages based on error type
      if (error.message === TIMEOUT_MESSAGE) {
        toast.error("Generation timeout", {
          description: "The AI is still working, but it's taking longer than expected. Try refreshing the page in a few moments to see if content has been generated."
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
