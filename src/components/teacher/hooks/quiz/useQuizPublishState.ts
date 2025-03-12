
import { useState } from 'react';

export const useQuizPublishState = (
  publishQuiz: () => Promise<boolean>,
  unpublishQuiz: () => Promise<boolean>,
  isPublished: boolean,
  setIsPublished: (value: boolean) => void
) => {
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
    togglePublishStatus
  };
};
