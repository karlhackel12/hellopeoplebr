
import { useState } from 'react';

export const useQuizPublishState = (
  publishQuiz: () => Promise<void>,
  unpublishQuiz: () => Promise<void>,
  isPublished: boolean,
  setIsPublished: (value: boolean) => void
) => {
  const [publishLoading, setPublishLoading] = useState(false);
  
  const togglePublishStatus = async (): Promise<void> => {
    try {
      setPublishLoading(true);
      
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
      } else {
        await publishQuiz();
        setIsPublished(true);
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    } finally {
      setPublishLoading(false);
    }
  };

  return {
    togglePublishStatus,
    publishLoading
  };
};
