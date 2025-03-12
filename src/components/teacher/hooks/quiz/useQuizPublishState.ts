
import { useState } from 'react';

export const useQuizPublishState = (
  publishQuiz: () => Promise<boolean>,
  unpublishQuiz: () => Promise<boolean>
) => {
  const [isPublished, setIsPublished] = useState(false);

  const togglePublishStatus = async (): Promise<boolean> => {
    try {
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
        }
        return success;
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
        }
        return success;
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      return false;
    }
  };

  return {
    isPublished,
    setIsPublished,
    togglePublishStatus
  };
};
