
import { QuizContentAnalyzer } from '../../quiz/services/QuizContentAnalyzer';

export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number, content: string) => Promise<boolean>,
  getLessonContent: () => Promise<string | null>
) => {
  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      // First check if we have pre-generated quiz questions from the lesson generation
      const storedQuizData = getStoredQuizData();
      
      if (storedQuizData && storedQuizData.questions && storedQuizData.questions.length > 0) {
        console.log("Using pre-generated quiz questions:", storedQuizData.questions.length);
        // Use the existing quiz data directly
        return await generateQuiz(numQuestions, JSON.stringify(storedQuizData));
      }
      
      // Fallback to regular content analysis if no pre-generated questions exist
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

  // Helper function to retrieve stored quiz data
  const getStoredQuizData = () => {
    try {
      // Get the most recent quiz data from localStorage
      const keys = Object.keys(localStorage).filter(key => key.startsWith('lesson_quiz_'));
      if (keys.length === 0) return null;
      
      // Sort by timestamp (newest first)
      keys.sort().reverse();
      const latestKey = keys[0];
      
      const quizData = localStorage.getItem(latestKey);
      if (!quizData) return null;
      
      // Parse the quiz data
      const parsedData = JSON.parse(quizData);
      
      // Clean up old quiz data
      if (keys.length > 1) {
        keys.slice(1).forEach(key => localStorage.removeItem(key));
      }
      
      // Remove the current one as well since we're using it now
      localStorage.removeItem(latestKey);
      
      return parsedData;
    } catch (error) {
      console.error("Error retrieving stored quiz data:", error);
      return null;
    }
  };

  return {
    generateSmartQuiz
  };
};
