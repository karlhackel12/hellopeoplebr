
import { toast } from 'sonner';
import { GenerationParams } from './types';
import { GeneratedLessonContent } from '../types';

export const useGenerationProcess = (
  invokeLessonGeneration: (params: GenerationParams) => Promise<any>,
  parseAIResponse: (output: any) => GeneratedLessonContent,
  updateFormContent: (content: GeneratedLessonContent, title: string, params: GenerationParams) => void,
  setGeneratedContent: (content: GeneratedLessonContent | null) => void,
  handleParsingError: (error: any) => void
) => {
  const processGeneration = async (generationParams: GenerationParams) => {
    toast.info("Content generation started", {
      description: "AI is working on your lesson content. This may take a minute...",
    });
    
    const response = await invokeLessonGeneration(generationParams);
    
    if (response.status === "succeeded" && response.output) {
      try {
        const parsedContent = parseAIResponse(response.output);
        setGeneratedContent(parsedContent);
        updateFormContent(parsedContent, generationParams.title, generationParams);
        
        toast.success("Content generated", {
          description: "AI-generated English lesson content is ready for review",
        });
        
        return parsedContent;
      } catch (parseError: any) {
        handleParsingError(parseError);
      }
    } else {
      throw new Error("Failed to generate content");
    }
  };

  return {
    processGeneration
  };
};
