
import { useState } from 'react';
import { fetchLessonContent } from './api/lessonContentApi';

export const useQuizContent = (lessonId: string) => {
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

  const getLessonContent = async (): Promise<string | null> => {
    try {
      if (lessonContent && isContentLoaded) {
        return lessonContent;
      }
      
      const content = await fetchLessonContent(lessonId);
      
      if (content) {
        setLessonContent(content);
        setIsContentLoaded(true);
        return content;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting lesson content:", error);
      return null;
    }
  };

  return {
    getLessonContent,
    isContentLoaded
  };
};
