
import { useState } from 'react';
import { toast } from 'sonner';

export const useQuizPublishState = (
  publishQuiz: () => Promise<void>,
  unpublishQuiz: () => Promise<void>
) => {
  const [isPublished, setIsPublished] = useState(false);

  const togglePublishStatus = async () => {
    try {
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
      } else {
        await publishQuiz();
        setIsPublished(true);
      }
      return true;
    } catch (error: any) {
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
