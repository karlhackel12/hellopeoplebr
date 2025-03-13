
import { useState } from 'react';
import { toast } from 'sonner';

export const useQuizPublishState = (
  publishQuiz: () => Promise<boolean>, 
  unpublishQuiz: () => Promise<boolean>, 
  isPublished: boolean, 
  setIsPublished: (value: boolean) => void
) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const togglePublishStatus = async (): Promise<void> => {
    try {
      setIsPublishing(true);
      
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
          toast.success('Quiz unpublished', {
            description: 'The quiz is now in draft mode and not visible to students',
          });
        } else {
          throw new Error('Failed to unpublish quiz');
        }
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
          toast.success('Quiz published', {
            description: 'The quiz is now visible to students',
          });
        } else {
          throw new Error('Failed to publish quiz');
        }
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to change publish status', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    togglePublishStatus,
    isPublishing,
  };
};
