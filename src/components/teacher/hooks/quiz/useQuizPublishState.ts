
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useQuizPublishState = (
  publishQuiz: () => Promise<void>,
  unpublishQuiz: () => Promise<void>,
  isPublished: boolean,
  setIsPublished: (value: boolean) => void
) => {
  const togglePublishStatus = useCallback(async () => {
    try {
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
        toast.success('Quiz unpublished', {
          description: 'The quiz is now in draft mode and not visible to students',
        });
      } else {
        await publishQuiz();
        setIsPublished(true);
        toast.success('Quiz published', {
          description: 'The quiz is now published and visible to students',
        });
      }
      return true;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to change publish status', {
        description: 'There was an error updating the quiz status',
      });
      return false;
    }
  }, [isPublished, publishQuiz, unpublishQuiz, setIsPublished]);

  return {
    togglePublishStatus
  };
};
