
import { toast } from 'sonner';
import { Question } from '../../quiz/types';

export const useQuizActions = (
  lessonId: string | undefined,
  saveQuizTitle: (title: string) => Promise<boolean>,
  deleteQuiz: () => Promise<boolean>,
  generateSmartQuiz: (numQuestions: string) => Promise<boolean>,
  fetchLessonContent: () => Promise<string | null>,
  fetchQuizQuestions: () => Promise<Question[] | null>
) => {
  const handleSaveQuiz = async (title: string): Promise<boolean> => {
    if (!lessonId) {
      toast.error('Missing lesson ID', {
        description: 'Cannot save quiz without a lesson ID',
      });
      return false;
    }

    try {
      return await saveQuizTitle(title);
    } catch (error) {
      console.error('Error saving quiz:', error);
      return false;
    }
  };

  const handleDiscardQuiz = async (): Promise<boolean> => {
    if (!lessonId) {
      toast.error('Missing lesson ID', {
        description: 'Cannot discard quiz without a lesson ID',
      });
      return false;
    }

    try {
      return await deleteQuiz();
    } catch (error) {
      console.error('Error discarding quiz:', error);
      return false;
    }
  };

  const handleGenerateQuiz = async (setContentLoadingMessage: (msg: string | null) => void): Promise<void> => {
    if (!lessonId) {
      toast.error('Missing lesson ID', {
        description: 'Cannot generate quiz without a lesson ID',
      });
      return;
    }

    try {
      setContentLoadingMessage('Fetching lesson content...');
      const content = await fetchLessonContent();
      
      if (!content) {
        toast.error('No lesson content', {
          description: 'The lesson needs content before generating a quiz',
        });
        setContentLoadingMessage(null);
        return;
      }
      
      setContentLoadingMessage('Generating quiz questions...');
      await generateSmartQuiz('5');
      
      setContentLoadingMessage('Loading quiz preview...');
      await fetchQuizQuestions();
      
      setContentLoadingMessage(null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setContentLoadingMessage(null);
    }
  };

  return {
    handleSaveQuiz,
    handleDiscardQuiz,
    handleGenerateQuiz
  };
};
