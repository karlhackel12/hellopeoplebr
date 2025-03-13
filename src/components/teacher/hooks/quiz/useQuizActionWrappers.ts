
import { toast } from 'sonner';

export const useQuizActionWrappers = (
  handleGenerateQuiz: (setContentLoadingMessage: (msg: string | null) => void) => Promise<void>,
  handleSaveQuiz: (title: string) => Promise<boolean>,
  handleDiscardQuiz: () => Promise<boolean>,
  resetPreview: () => void,
  setExistingQuiz: (value: boolean) => void,
  setIsPublished: (value: boolean) => void,
  setShowPreview: (value: boolean) => void,
  setContentLoading: (loading: string | null) => void
) => {
  // Wrapper for generating quiz
  const wrappedGenerateQuiz = async (): Promise<void> => {
    try {
      await handleGenerateQuiz(setContentLoading);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz', {
        description: error.message || 'An unexpected error occurred',
      });
    }
  };

  // Wrapper for saving quiz
  const wrappedSaveQuiz = async (title: string): Promise<void> => {
    try {
      const saved = await handleSaveQuiz(title);
      if (saved) {
        toast.success('Quiz saved', {
          description: 'Your quiz has been saved successfully',
        });
        setExistingQuiz(true);
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz', {
        description: error.message || 'An unexpected error occurred',
      });
    }
  };

  // Wrapper for discarding quiz
  const wrappedDiscardQuiz = async (): Promise<void> => {
    try {
      const discarded = await handleDiscardQuiz();
      if (discarded) {
        resetPreview();
        setExistingQuiz(false);
        setIsPublished(false);
        setShowPreview(false);
        toast.info('Quiz discarded', {
          description: 'Your quiz has been discarded',
        });
      }
    } catch (error: any) {
      console.error('Error discarding quiz:', error);
      toast.error('Failed to discard quiz', {
        description: error.message || 'An unexpected error occurred',
      });
    }
  };

  return {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  };
};
