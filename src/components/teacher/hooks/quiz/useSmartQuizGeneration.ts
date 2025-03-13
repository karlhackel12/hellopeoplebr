
export const useSmartQuizGeneration = (
  generateQuiz: (numQuestions: number, content?: string) => Promise<boolean>,
  getQuizContent: () => Promise<string | null>
) => {
  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      const content = await getQuizContent();
      if (!content) {
        return false;
      }
      
      return await generateQuiz(numQuestions, content);
    } catch (error) {
      console.error("Error in smart quiz generation:", error);
      return false;
    }
  };

  return {
    generateSmartQuiz
  };
};
