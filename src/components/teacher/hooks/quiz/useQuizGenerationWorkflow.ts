
import { useCallback } from "react";
import { useQuizGenerationState } from "./useQuizGenerationState";
import { useSmartQuizGeneration } from "./useSmartQuizGeneration";
import { useQuizActionWrappers } from "./useQuizActionWrappers";
import { useQuizDataProcessor } from "./useQuizDataProcessor";

export const useQuizGenerationWorkflow = () => {
  const {
    setNumQuestions,
    numQuestions,
    setCurrentPhase,
    contentLoadingMessage,
    setContentLoadingMessage,
    loadingError,
    setLoadingError,
    isRetrying,
    setIsRetrying,
  } = useQuizGenerationState();

  const { generateSmartQuiz, loading } = useSmartQuizGeneration();
  const { wrappedGenerateQuiz, wrappedSaveQuiz, wrappedDiscardQuiz } = useQuizActionWrappers();
  const { processQuizData } = useQuizDataProcessor();

  const generateQuizFromPrompt = useCallback(async (numQuestionsParam: string) => {
    try {
      // Reset states
      setCurrentPhase('loading');
      setContentLoadingMessage("Analyzing content and preparing to generate questions...");
      setLoadingError(null);

      // Generate quiz using the provided function
      setCurrentPhase('generating');
      setContentLoadingMessage("Generating quiz questions based on content...");
      
      // Parse the number of questions to generate
      const numQuestionsInt = parseInt(numQuestionsParam, 10) || 5;
      
      // Call API to generate quiz
      const result = await generateSmartQuiz(async () => {
        // This would be the actual API call to generate quiz
        // For now, we'll return a mock response
        return await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              questions: [
                {
                  question_text: "Example question 1",
                  question_type: "multiple_choice" as const,
                  options: [
                    { option_text: "Option A", is_correct: true },
                    { option_text: "Option B", is_correct: false }
                  ],
                  points: 1
                }
              ]
            });
          }, 1000);
        });
      }, numQuestionsInt);

      if (result) {
        // Process the result
        await processQuizData(result.questions);
        setCurrentPhase('complete');
        setContentLoadingMessage(null);
        return result;
      } else {
        // Handle failure
        setCurrentPhase('error');
        setLoadingError("Failed to generate quiz questions.");
        return null;
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setCurrentPhase('error');
      setLoadingError(error.message || "An unexpected error occurred");
      return null;
    }
  }, [generateSmartQuiz, processQuizData, setContentLoadingMessage, setCurrentPhase, setLoadingError]);

  return {
    generateQuizFromPrompt,
    loading,
    isRetrying,
    setIsRetrying,
    contentLoadingMessage,
    loadingError,
    numQuestions,
    setNumQuestions,
  };
};
