
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
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { invokeLessonGeneration } = useGenerationApi();
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
        toast.info("Content generation started", {
          description: "AI is working on your lesson content. This may take a minute...",
        });
        
        // Get the direct response from the edge function
        const response = await invokeLessonGeneration(generationParams);
        
        if (response.status === "succeeded" && response.output) {
          try {
            // Parse the AI response
            const parsedContent = parseAIResponse(response.output);
            setGeneratedContent(parsedContent);
            
            const metadata = {
              ...generationParams,
              model: "deepseek-r1",
              completed: new Date().toISOString(),
              status: 'succeeded'
            };
            
            const formattedContent = formatContent(parsedContent, title);
            form.setValue('content', formattedContent);
            form.setValue('contentSource', 'ai_generated');
            form.setValue('structuredContent', parsedContent);
            form.setValue('generationMetadata', metadata);
            
            toast.success("Content generated", {
              description: "AI-generated English lesson content is ready for review",
            });
            setGenerating(false);
          } catch (parseError: any) {
            console.error("Error parsing AI response:", parseError);
            console.log("Problem with output:", response.output);
            setError(`Failed to process the generated content: ${parseError.message}`);
            toast.error("Processing error", {
              description: "Failed to process the generated content. Check console for details.",
            });
            setGenerating(false);
          }
        } else {
          throw new Error("Failed to generate content");
        }
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
