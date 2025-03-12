
import { useState } from 'react';
import { toast } from 'sonner';

export const useQuizPublishState = (
  publishQuiz: () => Promise<void>,
  unpublishQuiz: () => Promise<void>
) => {
  const [isPublished, setIsPublished] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const togglePublishStatus = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
      } else {
        await publishQuiz();
        setIsPublished(true);
      }
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error('Action failed', {
        description: 'Failed to update quiz status. Please try again.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isPublished,
    setIsPublished,
    isToggling,
    togglePublishStatus
  };
};
