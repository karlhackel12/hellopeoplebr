
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { executeWithRetry } from '../utils/retryLogic';

// Types for analytics
export interface QuizGenerationAnalytics {
  contentLength: number;
  processingTimeMs: number;
  requestTimestamp: string;
  numQuestions: number;
  didSucceed: boolean;
  didUseFallback: boolean;
  numAttempts: number;
  errorType?: string;
}

// Analytics collection
const analyticsStore: QuizGenerationAnalytics[] = [];

/**
 * Handles the API call to generate quiz questions through the edge function
 */
export const generateQuizContent = async (lessonContent: string, numQuestions: number) => {
  const startTime = Date.now();
  let analytics: Partial<QuizGenerationAnalytics> = {
    contentLength: lessonContent?.length || 0,
    requestTimestamp: new Date().toISOString(),
    numQuestions,
    didSucceed: false,
    didUseFallback: false,
    numAttempts: 0
  };
  
  try {
    console.log(`Calling generate-quiz function with ${numQuestions} questions`);
    console.log(`Content length: ${lessonContent?.length || 0} characters`);
    
    // Use retry logic for more resilient API calls
    const { result, error, attempts } = await executeWithRetry(
      async () => {
        const response = await supabase.functions.invoke('generate-quiz', {
          body: { 
            lessonContent,
            numQuestions
          }
        });
        
        if (response.error) throw response.error;
        return response;
      },
      2, // Max attempts
      1000 // Delay between retries
    );
    
    analytics.numAttempts = attempts;
    
    if (error) {
      console.error('Error from edge function after retries:', error);
      analytics.errorType = error.message || 'unknown';
      throw error;
    }

    const response = result;
    
    // Check if the response indicates fallback questions were generated
    if (response?.data?.status === 'failed_with_fallback') {
      console.warn('Using fallback questions due to generation failure:', response.data.error);
      analytics.didUseFallback = true;
      toast.warning('Quiz generation partially failed', {
        description: 'Using simplified questions. You may want to regenerate or edit them.',
      });
    }
    
    analytics.didSucceed = true;
    analytics.processingTimeMs = Date.now() - startTime;
    analyticsStore.push(analytics as QuizGenerationAnalytics);

    return {
      data: response?.data,
      error: null,
      analytics: analytics as QuizGenerationAnalytics
    };
  } catch (error: any) {
    console.error('Error in quiz generation API:', error);
    
    // Complete analytics for error case
    analytics.processingTimeMs = Date.now() - startTime;
    analytics.didSucceed = false;
    analytics.errorType = error.message || 'unknown';
    analyticsStore.push(analytics as QuizGenerationAnalytics);
    
    return { 
      data: null, 
      error,
      analytics: analytics as QuizGenerationAnalytics
    };
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
      .select('content, title, estimated_minutes')
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
    console.log(`Lesson title: ${lesson.title}, Estimated time: ${lesson.estimated_minutes} minutes`);
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

/**
 * Gets aggregated analytics from quiz generation attempts
 */
export const getQuizGenerationAnalytics = () => {
  const totalAttempts = analyticsStore.length;
  if (totalAttempts === 0) return null;
  
  const successCount = analyticsStore.filter(a => a.didSucceed).length;
  const avgProcessingTime = analyticsStore.reduce(
    (sum, current) => sum + current.processingTimeMs, 0
  ) / totalAttempts;
  
  const fallbackCount = analyticsStore.filter(a => a.didUseFallback).length;
  
  return {
    totalAttempts,
    successRate: successCount / totalAttempts,
    avgProcessingTimeMs: avgProcessingTime,
    fallbackRate: fallbackCount / totalAttempts,
    recentAnalytics: analyticsStore.slice(-5) // Last 5 attempts
  };
};
