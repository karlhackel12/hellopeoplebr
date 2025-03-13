
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { executeWithRetry } from './utils/retryLogic';
import { toast } from 'sonner';

export interface ContentResult {
  content: string | null;
  error: string | null;
  isLoaded: boolean;
  isRetrying: boolean;
  attempts: number;
  totalSize: number;
}

export const useQuizContent = (lessonId: string) => {
  const [contentResult, setContentResult] = useState<ContentResult>({
    content: null,
    error: null,
    isLoaded: false,
    isRetrying: false,
    attempts: 0,
    totalSize: 0
  });
  
  const fetchingRef = useRef(false);
  
  /**
   * Retrieves lesson content with retry logic and enhanced error handling
   */
  const getLessonContent = async (): Promise<string | null> => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log('Content fetch already in progress');
      return contentResult.content;
    }
    
    try {
      fetchingRef.current = true;
      
      // Reset state for new fetch
      setContentResult(prev => ({
        ...prev,
        isRetrying: false,
        attempts: 0,
        error: null
      }));
      
      // Use retry logic to handle potential network issues
      const { result, error, attempts } = await executeWithRetry(
        async () => {
          const { data, error } = await supabase
            .from('lessons')
            .select('content')
            .eq('id', lessonId)
            .single();
          
          if (error) throw error;
          if (!data?.content) {
            throw new Error('Lesson has no content');
          }
          
          return {
            content: data.content,
            size: data.content.length
          };
        },
        3,  // max attempts
        1000 // delay between retries
      );
      
      // Update state based on result
      if (error) {
        console.error('Error fetching lesson content:', error);
        setContentResult({
          content: null,
          error: error.message,
          isLoaded: false,
          isRetrying: false,
          attempts,
          totalSize: 0
        });
        return null;
      }
      
      // Success case
      setContentResult({
        content: result?.content || null,
        error: null,
        isLoaded: true,
        isRetrying: false,
        attempts,
        totalSize: result?.size || 0
      });
      
      return result?.content || null;
    } catch (error: any) {
      console.error('Unexpected error in getLessonContent:', error);
      
      // Provide user-friendly error message
      toast.error('Error loading lesson content', {
        description: error.message || 'An unexpected error occurred',
      });
      
      setContentResult({
        content: null,
        error: error.message,
        isLoaded: false,
        isRetrying: false,
        attempts: 1,
        totalSize: 0
      });
      
      return null;
    } finally {
      fetchingRef.current = false;
    }
  };
  
  // Auto-fetch content when lessonId changes
  useEffect(() => {
    if (lessonId && !contentResult.isLoaded && !contentResult.error) {
      getLessonContent();
    }
  }, [lessonId]);
  
  return {
    ...contentResult,
    getLessonContent,
    isContentLoaded: contentResult.isLoaded,
    contentSize: contentResult.totalSize,
    contentError: contentResult.error
  };
};
