
import { toast } from 'sonner';
import { generateLesson } from '@/integrations/openai/client';

export const generateContent = async (settings: any) => {
  try {
    console.log('generateContent called with settings:', settings);
    const result = await generateLesson(settings);
    console.log('generateLesson result:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    toast.error('Generation Failed', {
      description: 'Failed to generate content. Please check your settings and try again.'
    });
    return null;
  }
};
