
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useQuizContent = (lessonId: string) => {
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  
  const getLessonContent = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .single();
      
      if (error) {
        console.error('Error fetching lesson content:', error);
        return null;
      }
      
      if (!data.content) {
        console.warn('Lesson has no content');
        return null;
      }
      
      setIsContentLoaded(true);
      return data.content;
    } catch (error) {
      console.error('Error in getLessonContent:', error);
      return null;
    }
  };
  
  return {
    getLessonContent,
    isContentLoaded
  };
};
