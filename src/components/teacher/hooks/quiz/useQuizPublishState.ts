
import { useState } from 'react';

export const useQuizPublishState = (
  publishQuiz: () => Promise<boolean>,
  unpublishQuiz: () => Promise<boolean>,
  isPublished: boolean,
  setIsPublished: (value: boolean) => void
) => {
  const togglePublishStatus = async (): Promise<void> => {
    try {
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
        }
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
        }
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  return {
    togglePublishStatus
  };
};
