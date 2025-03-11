
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenerationParams, PredictionResponse } from './types';

const MAX_POLL_ATTEMPTS = 20; // Maximum number of times to check status

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
      
      // If the response indicates the process is still running, return the ID
      if (resultData.status === 'pending' || resultData.status === 'processing') {
        return {
          id: resultData.id || 'pending',
          status: resultData.status,
          output: null
        };
      }
      
      // Handle direct output from the edge function
      return {
        id: resultData.id || 'direct',
        status: resultData.status || 'succeeded',
        output: resultData.lesson || resultData.output
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
  };

  const checkPredictionStatus = async (predictionId: string): Promise<PredictionResponse> => {
    console.log("Checking status for prediction:", predictionId);
    
    try {
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: { predictionId },
      });
      
      if (response.error || !response.data) {
        console.error("Status check error:", response.error);
        throw new Error(response.error?.message || "Failed to check generation status");
      }
      
      const resultData = response.data;
      console.log("Status check response:", resultData);
      
      return {
        id: predictionId,
        status: resultData.status || 'processing',
        output: resultData.lesson || resultData.output
      };
    } catch (error: any) {
      console.error("Error checking prediction status:", error);
      throw error;
    }
  };

  return {
    invokeLessonGeneration,
    checkPredictionStatus
  };
};
