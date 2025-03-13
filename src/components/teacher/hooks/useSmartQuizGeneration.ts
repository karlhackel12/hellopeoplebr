
import { Question } from '../../quiz/types';
import { QuizContentAnalyzer } from '../../quiz/services/QuizContentAnalyzer';

export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number, content: string) => Promise<Question[] | null>,
  getLessonContent: () => Promise<string | null>
) => {
  const generateSmartQuiz = async (numQuestions: number): Promise<Question[] | null> => {
    try {
      const content = await getLessonContent();
      if (!content) {
        return null;
      }
      
      const optimizedContent = QuizContentAnalyzer.prepareContentForQuizGeneration(
        content, 
        numQuestions
      );
      
      return await generateQuiz(numQuestions, optimizedContent);
    } catch (error) {
      console.error("Error in smart quiz generation:", error);
      return null;
    }
  };

  return {
    generateSmartQuiz
  };
};
