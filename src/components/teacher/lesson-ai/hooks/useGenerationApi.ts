
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenerationParams, PredictionResponse } from './types';

export const useGenerationApi = () => {
  const invokeLessonGeneration = async (generationParams: GenerationParams): Promise<PredictionResponse> => {
    console.log("Invoking generate-lesson-content function with params:", generationParams);
      
    try {
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: generationParams,
      });
      
      if (response.error || !response.data) {
        console.error("Edge function error:", response.error);
        
        const errorMsg = response.error?.message || "Failed to start content generation";
        
        // Handle specific error cases
        if (errorMsg.includes("REPLICATE_API_KEY is not set")) {
          toast.error("API key not configured", {
            description: "The Replicate API key is not set in the Supabase Edge Function secrets.",
          });
        }
        
        throw new Error(errorMsg);
      }

      const resultData = response.data;
      console.log("Edge function response:", resultData);
      
      // Handle direct output from the edge function
      return {
        id: 'direct', // Not using an actual prediction ID anymore
        status: resultData.status || 'succeeded',
        output: resultData.output
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
  };

  // This method is no longer needed with direct responses, but kept for compatibility
  const checkPredictionStatus = async (predictionId: string): Promise<any> => {
    // This is a placeholder since we're not using polling anymore
    console.log("checkPredictionStatus is deprecated, using direct responses now");
    return { status: "succeeded" };
  };

  return {
    invokeLessonGeneration,
    checkPredictionStatus
  };
};
