
import { supabase } from '@/integrations/supabase/client';

export const fetchLessonContent = async (lessonId: string): Promise<string | null> => {
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
