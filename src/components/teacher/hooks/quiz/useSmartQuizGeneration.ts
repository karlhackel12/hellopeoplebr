
import { toast } from 'sonner';

export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number) => Promise<boolean>,
  getLessonContent: () => Promise<string | null>
) => {
  const generateSmartQuiz = async (numQuestions: string): Promise<boolean> => {
    try {
      const lessonContent = await getLessonContent();
      
      if (!lessonContent) {
        toast.error('No lesson content', {
          description: 'The lesson needs content before generating a quiz',
        });
        return false;
      }
      
      const numQuestionsInt = parseInt(numQuestions, 10);
      if (isNaN(numQuestionsInt) || numQuestionsInt < 1) {
        toast.error('Invalid number of questions', {
          description: 'Please provide a valid number of questions to generate',
        });
        return false;
      }
      
      // Call the actual quiz generation with the parsed number
      return await generateQuiz(numQuestionsInt);
    } catch (error) {
      console.error('Error in smart quiz generation:', error);
      return false;
    }
  };

  return { generateSmartQuiz };
};
