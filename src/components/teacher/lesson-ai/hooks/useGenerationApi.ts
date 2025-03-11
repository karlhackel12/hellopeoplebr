
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

      const predictionData = response.data;
      console.log("Edge function response:", predictionData);
      
      if (!predictionData?.id) {
        throw new Error("No prediction ID returned from generation service");
      }
      
      return predictionData;
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
  };

  const checkPredictionStatus = async (predictionId: string): Promise<any> => {
    const apiKey = import.meta.env.VITE_REPLICATE_API_KEY || '';
    if (!apiKey) {
      throw new Error("Replicate API key is not configured");
    }
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to check prediction status: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to check prediction status: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  };

  return {
    invokeLessonGeneration,
    checkPredictionStatus
  };
};
