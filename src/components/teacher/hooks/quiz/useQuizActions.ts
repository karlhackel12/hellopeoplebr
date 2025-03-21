
import { toast } from 'sonner';

export const useQuizActions = (
  lessonId: string | undefined,
  saveQuizTitle: (title: string) => Promise<void>,
  deleteQuiz: () => Promise<void>,
  generateSmartQuiz: (numQuestions: number) => Promise<boolean>,
  fetchLessonContent: () => Promise<string | null>,
  fetchQuizQuestions: () => Promise<any[]>
) => {
  const handleSaveQuiz = async (quizTitle: string): Promise<boolean> => {
    try {
      await saveQuizTitle(quizTitle);
      toast.success('Quiz saved', {
        description: 'Your quiz has been saved successfully.',
      });
      return true;
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error('Failed to save quiz', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    }
  };

  const handleDiscardQuiz = async (): Promise<boolean> => {
    if (!lessonId) return false;
    
    try {
      await deleteQuiz();
      toast.success('Quiz deleted', {
        description: 'Your quiz has been deleted successfully.',
      });
      return true;
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      toast.error('Failed to delete quiz', {
        description: error.message || 'An unexpected error occurred',
      });
      return false;
    }
  };

  const handleGenerateQuiz = async (setContentLoadingMessage: (msg: string | null) => void): Promise<boolean> => {
    if (!lessonId) {
      toast.error('Missing lesson', {
        description: 'Please save the lesson before generating a quiz.',
      });
      return false;
    }
    
    try {
      // First check if we have lesson content
      setContentLoadingMessage('Analyzing lesson content...');
      const content = await fetchLessonContent();
      setContentLoadingMessage(null);
      
      if (!content) {
        toast.error('Missing content', {
          description: 'Cannot find lesson content to generate quiz questions.',
        });
        return false;
      }
      
      // Generate the quiz with smart content analysis
      const result = await generateSmartQuiz(5); // Default to 5 questions if none specified
      
      if (result) {
        const questions = await fetchQuizQuestions();
        
        if (questions && questions.length > 0) {
          toast.success('Quiz generated', {
            description: 'Your quiz questions have been generated. Review them below.',
          });
          return true;
        } else {
          toast.error('No questions generated', {
            description: 'The quiz was created but no questions were generated. Please try again.',
          });
        }
      }
      return false;
    } catch (error: any) {
      console.error("Error handling quiz generation:", error);
      return false;
    }
  };

  return {
    handleSaveQuiz,
    handleDiscardQuiz,
    handleGenerateQuiz
  };
};
