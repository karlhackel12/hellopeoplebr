import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Handles the API call to generate quiz questions through the edge function
 */
export const generateQuizContent = async (lessonContent: string, numQuestions: number) => {
  try {
    console.log(`Calling generate-quiz function with ${numQuestions} questions`);
    
    // Check if the content is already pre-formatted quiz data
    let isPreGenerated = false;
    try {
      const parsedContent = JSON.parse(lessonContent);
      isPreGenerated = parsedContent && 
                      parsedContent.questions && 
                      Array.isArray(parsedContent.questions);
    } catch (e) {
      // Not JSON, treat as regular content
      isPreGenerated = false;
    }
    
    if (isPreGenerated) {
      console.log("Using pre-generated quiz questions");
      // Use pre-generated quiz data directly
      return {
        data: JSON.parse(lessonContent),
        error: null
      };
    }
    
    // Otherwise, call the edge function to generate questions
    const response = await supabase.functions.invoke('generate-quiz', {
      body: { 
        lessonContent,
        numQuestions
      }
    });

    if (response.error) {
      console.error('Error from edge function:', response.error);
      throw response.error;
    }

    // Check if the response indicates fallback questions were generated
    if (response.data?.status === 'failed_with_fallback') {
      console.warn('Using fallback questions due to generation failure:', response.data.error);
      toast.warning('Quiz generation partially failed', {
        description: 'Using simplified questions. You may want to regenerate or edit them.',
      });
    }

    return {
      data: response.data,
      error: null
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
    console.log(`Fetching content for lesson: ${lessonId}`);
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('content')
      .eq('id', lessonId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching lesson content:', error);
      throw error;
    }
    
    if (!lesson?.content) {
      console.warn('No content found for lesson');
      return null;
    }
    
    console.log(`Fetched ${lesson.content.length} characters of content`);
    return lesson.content;
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
  } else if (error.status === 504 || error.message?.includes('timeout')) {
    toast.error('Request timed out', {
      description: 'The quiz generation is taking too long. Try again with a shorter lesson or fewer questions.',
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
