
import { toast } from 'sonner';
import { GeneratedLessonContent } from '../types';

export const useValidation = (setGenerating: (generating: boolean) => void, setGenerationStatus: (status: string) => void) => {
  const validateTitleInput = (title: string): boolean => {
    if (!title?.trim()) {
      toast.error("Title required", {
        description: "Please provide a lesson title before generating content",
      });
      setGenerating(false);
      setGenerationStatus('failed');
      return false;
    }
    return true;
  };

  const validateStructuredContent = (content: GeneratedLessonContent | null): boolean => {
    if (!content) return false;
    
    const requiredFields = [
      'description',
      'objectives',
      'practicalSituations',
      'keyPhrases',
      'vocabulary',
      'explanations',
      'tips'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = content[field as keyof GeneratedLessonContent];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return !value;
    });
    
    if (missingFields.length > 0) {
      toast.error("Invalid content structure", {
        description: `Missing required fields: ${missingFields.join(', ')}`,
      });
      return false;
    }
    
    return true;
  };

  return {
    validateTitleInput,
    validateStructuredContent
  };
};
