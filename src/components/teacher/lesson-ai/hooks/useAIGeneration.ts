
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from '../../lesson-editor/useLessonForm';
import { toast } from 'sonner';
import { GeneratedLessonContent } from '../types';
import { formatContent } from '../contentUtils';
import { useGenerationApi } from './useGenerationApi';
import { useResponseParser } from './useResponseParser';
import { GenerationParams } from './types';

export const useAIGeneration = (form: UseFormReturn<LessonFormValues>, title: string) => {
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedLessonContent | null>(null);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [pollInterval, setPollInterval] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const { invokeLessonGeneration, checkPredictionStatus } = useGenerationApi();
  const { parseAIResponse } = useResponseParser();

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
      
      const generationParams: GenerationParams = {
        timestamp: new Date().toISOString(),
        title,
        level,
        language: 'english',
        instructions: instructions.trim() || undefined,
      };
      
      try {
        const predictionData = await invokeLessonGeneration(generationParams);
        
        toast.info("Content generation started", {
          description: "AI is working on your lesson content. This may take a minute...",
        });
        
        // Start polling for results
        startPolling(predictionData.id, generationParams);
      } catch (invokeError: any) {
        console.error("Error generating lesson content:", invokeError);
        
        // Handle specific error cases
        const errorMessage = invokeError?.message || "Failed to call the generation service";
        setError(errorMessage);
        
        toast.error("Generation failed", {
          description: "Failed to call the AI generation service. Please try again later.",
        });
        
        setGenerating(false);
      }
    } catch (error: any) {
      console.error("Error generating lesson content:", error);
      setError(error?.message || "Unknown error");
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate lesson content",
      });
      setGenerating(false);
    }
  };
  
  const startPolling = (predictionId: string, generationParams: GenerationParams) => {
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
        
        try {
          const prediction = await checkPredictionStatus(predictionId);
          console.log("Prediction status:", prediction.status);
          
          // Reset retry count on successful response
          if (retryCount > 0) {
            setRetryCount(0);
          }
          
          if (prediction.status === "succeeded") {
            clearInterval(interval);
            setPollInterval(null);
            
            try {
              let output = prediction.output;
              console.log("Raw output:", output);
              
              // Parse the AI response
              const parsedContent = parseAIResponse(output);
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
        } catch (statusError) {
          // If we get an error but have retries left, we'll continue polling
          if (retryCount < maxRetries) {
            setRetryCount(retryCount + 1);
            console.log(`Retry ${retryCount + 1}/${maxRetries} for prediction status check`);
            return; // Continue polling
          }
          
          throw statusError;
        }
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
