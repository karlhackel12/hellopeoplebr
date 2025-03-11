
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
      
      const response = await supabase.functions.invoke('generate-lesson-content', {
        body: {
          title,
          level,
          language: 'english',
          instructions: instructions.trim() || undefined,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const predictionData = response.data;
      
      if (!predictionData?.id) {
        throw new Error("Failed to start content generation");
      }
      
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
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            "Authorization": `Token ${import.meta.env.VITE_REPLICATE_API_KEY || ''}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to check prediction status");
        }
        
        const prediction = await response.json();
        
        if (prediction.status === "succeeded") {
          clearInterval(interval);
          setPollInterval(null);
          
          try {
            let output = prediction.output;
            
            const jsonStart = output.indexOf('{');
            const jsonEnd = output.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              output = output.substring(jsonStart, jsonEnd);
            }
            
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
            console.error("Error parsing AI response:", parseError, prediction.output);
            toast.error("Processing error", {
              description: "Failed to process the generated content",
            });
          }
          
          setGenerating(false);
        } else if (prediction.status === "failed") {
          clearInterval(interval);
          setPollInterval(null);
          throw new Error(prediction.error || "Generation failed");
        }
        
        if (prediction.status === "starting" || prediction.status === "processing") {
          // For 'starting' or 'processing' statuses, we continue polling
        }
        
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
