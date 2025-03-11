
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const clearErrors = () => {
    setError(null);
  };

  const handleGenerate = async () => {
    try {
      clearErrors();
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
      } catch (invokeError: any) {
        console.error("Error invoking edge function:", invokeError);
        
        // Handle specific error cases
        const errorMessage = invokeError?.message || "Failed to call the generation service";
        setError(errorMessage);
        
        toast.error("Generation failed", {
          description: "Failed to call the AI generation service. Please try again later.",
        });
        
        setGenerating(false);
        return;
      }
      
      if (response.error || !response.data) {
        console.error("Edge function error:", response.error);
        
        const errorMsg = response.error?.message || "Failed to start content generation";
        setError(errorMsg);
        
        // Handle specific error cases
        if (errorMsg.includes("REPLICATE_API_KEY is not set")) {
          toast.error("API key not configured", {
            description: "The Replicate API key is not set in the Supabase Edge Function secrets.",
          });
        } else {
          toast.error("Generation failed", {
            description: errorMsg,
          });
        }
        
        setGenerating(false);
        return;
      }

      const predictionData = response.data;
      console.log("Edge function response:", predictionData);
      
      if (!predictionData?.id) {
        setError("No prediction ID returned from generation service");
        toast.error("Generation failed", {
          description: "Failed to start content generation - no prediction ID returned",
        });
        setGenerating(false);
        return;
      }
      
      toast.info("Content generation started", {
        description: "AI is working on your lesson content. This may take a minute...",
      });
      
      // Start polling for results
      startPolling(predictionData.id, generationParams);
      
    } catch (error: any) {
      console.error("Error generating lesson content:", error);
      setError(error?.message || "Unknown error");
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
    const maxAttempts = 60; // ~2 minutes with 2 second intervals
    
    const interval = setInterval(async () => {
      try {
        attemptCount++;
        console.log(`Checking prediction status for ${predictionId} (attempt ${attemptCount}/${maxAttempts})`);
        
        if (attemptCount >= maxAttempts) {
          clearInterval(interval);
          setPollInterval(null);
          setError("Generation timed out");
          toast.error("Generation timed out", {
            description: "The AI generation is taking longer than expected. Please try again.",
          });
          setGenerating(false);
          return;
        }
        
        const apiKey = import.meta.env.VITE_REPLICATE_API_KEY || '';
        if (!apiKey) {
          clearInterval(interval);
          setPollInterval(null);
          setError("Replicate API key is not configured");
          toast.error("Configuration error", {
            description: "Replicate API key is not configured in your environment.",
          });
          setGenerating(false);
          return;
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
          
          // If we get an error but have retries left, we'll continue polling
          if (retryCount < maxRetries) {
            setRetryCount(retryCount + 1);
            console.log(`Retry ${retryCount + 1}/${maxRetries} for prediction status check`);
            return; // Continue polling
          }
          
          throw new Error(`Failed to check prediction status: ${response.status} ${response.statusText}`);
        }
        
        // Reset retry count on successful response
        if (retryCount > 0) {
          setRetryCount(0);
        }
        
        const prediction = await response.json();
        console.log("Prediction status:", prediction.status);
        
        if (prediction.status === "succeeded") {
          clearInterval(interval);
          setPollInterval(null);
          
          try {
            let output = prediction.output;
            console.log("Raw output:", output);
            
            // Try to extract JSON from the output
            let parsedContent;
            if (typeof output === 'string') {
              const jsonStart = output.indexOf('{');
              const jsonEnd = output.lastIndexOf('}') + 1;
              
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                output = output.substring(jsonStart, jsonEnd);
              }
              
              console.log("Extracted JSON:", output);
              parsedContent = JSON.parse(output) as GeneratedLessonContent;
            } else if (Array.isArray(output) && output.length > 0) {
              // Some models return an array of strings
              const fullText = output.join('');
              const jsonStart = fullText.indexOf('{');
              const jsonEnd = fullText.lastIndexOf('}') + 1;
              
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonText = fullText.substring(jsonStart, jsonEnd);
                console.log("Extracted JSON from array:", jsonText);
                parsedContent = JSON.parse(jsonText) as GeneratedLessonContent;
              } else {
                throw new Error("Could not extract valid JSON from array output");
              }
            } else {
              // Direct object output
              parsedContent = output as GeneratedLessonContent;
            }
            
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
          } catch (parseError: any) {
            console.error("Error parsing AI response:", parseError);
            console.log("Problem with output:", prediction.output);
            setError(`Failed to process the generated content: ${parseError.message}`);
            toast.error("Processing error", {
              description: "Failed to process the generated content. Check console for details.",
            });
          }
          
          setGenerating(false);
        } else if (prediction.status === "failed") {
          clearInterval(interval);
          setPollInterval(null);
          console.error("Prediction failed:", prediction.error);
          setError(prediction.error || "Generation failed");
          toast.error("Generation failed", {
            description: prediction.error || "The AI generation process failed. Please try again.",
          });
          setGenerating(false);
        }
        // Continue polling for "starting" or "processing" statuses
        
      } catch (error: any) {
        clearInterval(interval);
        setPollInterval(null);
        console.error("Error checking prediction status:", error);
        setError(error?.message || "Unknown error checking generation status");
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
    handleGenerate,
    error,
    clearErrors
  };
};
