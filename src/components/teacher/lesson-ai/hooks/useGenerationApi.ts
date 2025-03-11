
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
        throw new Error(response.error?.message || "Failed to start content generation");
      }

      const resultData = response.data;
      console.log("Edge function response:", resultData);
      
      return {
        id: 'direct',
        status: resultData.status || 'succeeded',
        output: resultData.lesson || resultData.output
      };
    } catch (error: any) {
      console.error("Error invoking edge function:", error);
      throw error;
    }
  };

  return {
    invokeLessonGeneration
  };
};
