
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useQuizExistingData = (
  lessonId: string | undefined,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  loadQuizPreview: () => Promise<void>
) => {
  useEffect(() => {
    const checkExistingQuiz = async () => {
      if (!lessonId) return;
      
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('id, is_published')
          .eq('lesson_id', lessonId)
          .maybeSingle();
        
        if (error) {
          console.error('Error checking existing quiz:', error);
          return;
        }
        
        if (data) {
          setExistingQuiz(true);
          setIsPublished(data.is_published);
          await loadQuizPreview();
        } else {
          setExistingQuiz(false);
          setIsPublished(false);
        }
      } catch (error) {
        console.error('Error in checkExistingQuiz:', error);
      }
    };
    
    checkExistingQuiz();
  }, [lessonId, setExistingQuiz, setIsPublished, loadQuizPreview]);
};
