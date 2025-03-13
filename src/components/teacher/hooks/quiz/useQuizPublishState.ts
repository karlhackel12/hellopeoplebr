
import { useState } from 'react';

export const useQuizPublishState = (
  publishQuiz: () => Promise<void>,
  unpublishQuiz: () => Promise<void>,
  isPublished: boolean,
  setIsPublished: (value: boolean) => void
) => {
  const [publishLoading, setPublishLoading] = useState(false);
  
  const togglePublishStatus = async (): Promise<boolean> => {
    try {
      setPublishLoading(true);
      
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
        return false;
      } else {
        await publishQuiz();
        setIsPublished(true);
        return true;
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      return isPublished; // Return the current state if there was an error
    } finally {
      setPublishLoading(false);
    }
  };

  return {
    togglePublishStatus,
    publishLoading
  };
};
