
import { QuizContentAnalyzer } from '../../quiz/services/QuizContentAnalyzer';

export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number, content: string) => Promise<boolean>,
  getLessonContent: () => Promise<string | null>
) => {
  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      const content = await getLessonContent();
      if (!content) {
        return false;
      }
      
      const optimizedContent = QuizContentAnalyzer.prepareContentForQuizGeneration(
        content, 
        numQuestions
      );
      
      return await generateQuiz(numQuestions, optimizedContent);
    } catch (error) {
      console.error("Error in smart quiz generation:", error);
      return false;
    }
  };

  return {
    generateSmartQuiz
  };
};
