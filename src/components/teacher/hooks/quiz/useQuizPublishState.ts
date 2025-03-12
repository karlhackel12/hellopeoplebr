
import { useState } from 'react';
import { toast } from 'sonner';

export const useQuizPublishState = (
  publishQuiz: () => Promise<boolean>,
  unpublishQuiz: () => Promise<boolean>
) => {
  const [isPublished, setIsPublished] = useState(false);

  const togglePublishStatus = async () => {
    try {
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
          toast.success('Quiz unpublished', {
            description: 'Your quiz is now hidden from students.',
          });
        }
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
          toast.success('Quiz published', {
            description: 'Your quiz is now visible to students.',
          });
        }
      }
      return true;
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error('Action failed', {
        description: error.message || 'Failed to change publish status. Please try again.',
      });
      return false;
    }
  };

  return {
    isPublished,
    setIsPublished,
    togglePublishStatus
  };
};
