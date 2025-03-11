
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GenerationParams, PredictionResponse } from './types';

export const useGenerationApi = () => {
  // Function to start lesson generation
  const invokeLessonGeneration = async (generationParams: GenerationParams): Promise<PredictionResponse> => {
    console.log("Invoking generate-lesson-content function with params:", generationParams);
      
    try {
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: generationParams,
      });
      
      if (response.error || !response.data) {
        console.error("Edge function error:", response.error);
        const errorMsg = response.error?.message || "Failed to start content generation";
        throw new Error(errorMsg);
      }

      const resultData = response.data;
      console.log("Edge function response:", resultData);
      
      // Return a properly formatted response
      return {
        id: resultData.id || 'unknown',
        status: resultData.status || 'pending',
        output: resultData.lesson || resultData.output
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
  };

  // Function to check the status of an ongoing generation process
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
      
      // Normalize the status to one of our expected types
      let status: PredictionResponse['status'];
      if (resultData.status === 'succeeded') {
        status = 'succeeded';
      } else if (resultData.status === 'failed') {
        status = 'failed';
      } else if (resultData.status === 'processing') {
        status = 'processing';
      } else {
        status = 'pending';
      }
      
      return {
        id: predictionId,
        status: status,
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
