
import { toast } from 'sonner';

export interface GenerationSettings {
  title: string;
  grade: string;
  subject: string;
  language: string;
  timestamp: string;
  additionalInstructions?: string;
}

export const validateGenerationSettings = (settings: GenerationSettings): boolean => {
  console.log('Validating settings:', settings);
  if (!settings.title) {
    toast.error('Missing title', {
      description: 'Please provide a lesson title before generating content.'
    });
    return false;
  }
  if (!settings.grade) {
    toast.error('Missing level', {
      description: 'Please select an English proficiency level before generating content.'
    });
    return false;
  }
  return true;
};
