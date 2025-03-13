
import { useState } from 'react';
import { fetchLessonContent } from './api/lessonContentApi';

export const useQuizContent = (lessonId: string) => {
  const [content, setContent] = useState<string | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [contentLoadError, setContentLoadError] = useState<string | null>(null);

  const getLessonContent = async (): Promise<string | null> => {
    try {
      if (!lessonId) {
        return null;
      }
      
      // If we already have the content, return it
      if (content) {
        return content;
      }
      
      const lessonContent = await fetchLessonContent(lessonId);
      
      if (lessonContent) {
        setContent(lessonContent);
        setIsContentLoaded(true);
        return lessonContent;
      } else {
        setContentLoadError('Failed to load lesson content');
        return null;
      }
    } catch (error) {
      console.error('Error getting lesson content:', error);
      setContentLoadError('Error loading lesson content');
      return null;
    }
  };

  return {
    content,
    getLessonContent,
    isContentLoaded,
    contentLoadError
  };
};
