
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { LessonFormValues } from '../lesson-editor/useLessonForm';
import { toast } from 'sonner';
import { GeneratedLessonContent } from './types';
import { formatContent } from './contentUtils';

export const useAIGeneration = (form: UseFormReturn<LessonFormValues>, title: string) => {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedLessonContent | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      
      if (!title.trim()) {
        toast.error("Title required", {
          description: "Please provide a lesson title before generating content",
        });
        setGenerating(false);
        return;
      }
      
      const generationParams = {
        timestamp: new Date().toISOString(),
        title,
        level,
        language: 'english',
        instructions: instructions.trim() || undefined,
      };
      
      console.log("Invoking generate-lesson-content function with params:", generationParams);
      
      let response;
      try {
        response = await supabase.functions.invoke('generate-lesson-content', {
          body: generationParams,
        });
      } catch (invokeError) {
        console.error("Error invoking edge function:", invokeError);
        
        // Check if Replicate API key is potentially missing
        if (!import.meta.env.VITE_REPLICATE_API_KEY) {
          toast.error("API key missing", {
            description: "The Replicate API key needs to be configured in Supabase Edge Function secrets",
          });
          setGenerating(false);
          return;
        }
        
        throw new Error("Failed to call the generation service. Please try again later.");
      }
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        
        // Handle specific errors
        if (response.error.message?.includes("REPLICATE_API_KEY is not set")) {
          toast.error("API key not configured", {
            description: "Please add the Replicate API key in the Supabase Edge Function secrets",
          });
          setGenerating(false);
          return;
        }
        
        throw new Error(response.error.message || "Failed to start content generation");
      }

      const predictionData = response.data;
      console.log("Edge function response:", predictionData);
      
      if (!predictionData?.id) {
        throw new Error("Failed to start content generation - no prediction ID returned");
      }
      
      toast.info("Content generation started", {
        description: "AI is working on your lesson content. This may take a minute...",
      });
      
      startPolling(predictionData.id, generationParams);
      
    } catch (error) {
      console.error("Error generating lesson content:", error);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
      setGenerating(false);
    }
  };
  
  const startPolling = (predictionId: string, generationParams: any) => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    let attemptCount = 0;
    const maxAttempts = 30; // ~1 minute with 2 second intervals
    
    const interval = setInterval(async () => {
      try {
        attemptCount++;
        console.log(`Checking prediction status for ${predictionId} (attempt ${attemptCount}/${maxAttempts})`);
        
        if (attemptCount >= maxAttempts) {
          clearInterval(interval);
          setPollInterval(null);
          throw new Error("Generation timed out. Please try again later.");
        }
        
        const apiKey = import.meta.env.VITE_REPLICATE_API_KEY || '';
        if (!apiKey) {
          clearInterval(interval);
          setPollInterval(null);
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
        
        const prediction = await response.json();
        console.log("Prediction status:", prediction.status);
        
        if (prediction.status === "succeeded") {
          clearInterval(interval);
          setPollInterval(null);
          
          try {
            let output = prediction.output;
            console.log("Raw output:", output);
            
            const jsonStart = output.indexOf('{');
            const jsonEnd = output.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              output = output.substring(jsonStart, jsonEnd);
            }
            
            console.log("Extracted JSON:", output);
            
            const parsedContent = JSON.parse(output) as GeneratedLessonContent;
            setGeneratedContent(parsedContent);
            
            const metadata = {
              ...generationParams,
              model: prediction.model,
              predictionId: predictionId,
              completed: prediction.completed_at,
              status: prediction.status
            };
            
            const formattedContent = formatContent(parsedContent, title);
            form.setValue('content', formattedContent);
            form.setValue('contentSource', 'ai_generated');
            form.setValue('structuredContent', parsedContent);
            form.setValue('generationMetadata', metadata);
            
            toast.success("Content generated", {
              description: "AI-generated English lesson content is ready for review",
            });
          } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.log("Problem with output:", prediction.output);
            toast.error("Processing error", {
              description: "Failed to process the generated content. Check console for details.",
            });
          }
          
          setGenerating(false);
        } else if (prediction.status === "failed") {
          clearInterval(interval);
          setPollInterval(null);
          console.error("Prediction failed:", prediction.error);
          throw new Error(prediction.error || "Generation failed");
        }
        // Continue polling for "starting" or "processing" statuses
        
      } catch (error) {
        clearInterval(interval);
        setPollInterval(null);
        console.error("Error checking prediction status:", error);
        toast.error("Generation failed", {
          description: error instanceof Error ? error.message : "Failed to check generation status",
        });
        setGenerating(false);
      }
    }, 2000);
    
    setPollInterval(interval as unknown as number);
  };

  return {
    generating,
    generatedContent,
    level,
    setLevel,
    instructions,
    setInstructions,
    handleGenerate
  };
};
