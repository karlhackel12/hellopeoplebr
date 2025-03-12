
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Handles the API call to generate quiz questions through the edge function
 */
export const generateQuizContent = async (lessonContent: string, numQuestions: number) => {
  try {
    const response = await supabase.functions.invoke('generate-quiz', {
      body: { 
        lessonContent,
        numQuestions
      }
    });

    return {
      data: response.data,
      error: response.error
    };
  } catch (error: any) {
    console.error('Error in quiz generation API:', error);
    return { data: null, error };
  }
};

/**
 * Fetches lesson content for a specific lesson
 */
export const fetchLessonContent = async (lessonId: string) => {
  try {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('content')
      .eq('id', lessonId)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return lesson?.content || null;
  } catch (error) {
    console.error("Error fetching lesson content:", error);
    return null;
  }
};

/**
 * Handles errors in quiz generation with user-friendly messages
 */
export const handleQuizGenerationError = (error: any) => {
  console.error('Error generating quiz:', error);
  
  // More descriptive error messages
  if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
    toast.error('Network error', {
      description: 'Could not connect to the quiz generation service. Please check your internet connection and try again.',
    });
  } else if (error.status === 429) {
    toast.error('Too many requests', {
      description: 'Quiz generation service is busy. Please wait a moment and try again.',
    });
  } else if (error.status >= 500) {
    toast.error('Server error', {
      description: 'There was a problem with the quiz generation service. Our team has been notified.',
    });
  } else {
    toast.error('Failed to generate quiz', {
      description: error.message || 'An unexpected error occurred',
    });
  }
};
