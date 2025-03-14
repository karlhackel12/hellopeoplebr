
import { toast } from 'sonner';

interface GenerationSettings {
  title: string;
  grade_level?: string;
  subject?: string;
  length?: string;
  tone?: string;
  focus_areas?: string;
  additional_instructions?: string;
}

// Mock function to simulate API call to OpenAI
export const generateLesson = async (settings: GenerationSettings) => {
  try {
    console.log('Generating lesson with settings:', settings);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response structure
    const mockResponse = {
      data: {
        sections: [
          {
            title: 'Introduction',
            content: `This is an introduction to ${settings.title}. The content is tailored for ${settings.grade_level} students studying ${settings.subject}.`,
            type: 'introduction'
          },
          {
            title: 'Main Content',
            content: 'This is the main content of the lesson, generated based on your specifications.',
            type: 'content'
          },
          {
            title: 'Exercise',
            content: 'Here are some practice exercises related to the lesson.',
            type: 'exercise'
          },
          {
            title: 'Summary',
            content: 'This is a summary of the key points in this lesson.',
            type: 'summary'
          }
        ],
        metadata: {
          grade: settings.grade_level,
          subject: settings.subject,
          estimatedTime: settings.length || '30 minutes',
          objectives: ['Learn key concepts', 'Practice skills', 'Apply knowledge'],
          keywords: ['education', settings.subject || 'general', settings.title]
        }
      }
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error generating lesson:', error);
    toast.error('Failed to generate lesson content');
    throw error;
  }
};
