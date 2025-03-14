
import { useCallback, useState } from "react";
import { useQuizGenerationState } from "./useQuizGenerationState";
import { useSmartQuizGeneration } from "./useSmartQuizGeneration";
import { useQuizActionWrappers } from "./useQuizActionWrappers";
import { useQuizDataProcessor } from "./useQuizDataProcessor";
import { Question } from "../../quiz/types";

export const useQuizGenerationWorkflow = () => {
  const {
    setNumQuestions,
    numQuestions,
    contentLoadingMessage,
    loadingError,
    setLoadingError,
    isRetrying,
    setGenerationPhase,
    setError
  } = useQuizGenerationState();

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

  const { generateSmartQuiz, loading } = useSmartQuizGeneration();
  
  // Create mock functions for the wrapper since we're not actually using the result
  const mockHandleGenerateQuiz = async () => true;
  const mockHandleSaveQuiz = async () => true;
  const mockHandleDiscardQuiz = async () => true;
  const mockResetPreview = () => {};
  const mockSetExistingQuiz = () => {};
  const mockSetIsPublished = () => {};
  const mockSetShowPreview = () => {};
  const mockSetContentLoading = () => {};
  
  // Pass the mock functions to satisfy the type requirements
  const { wrappedGenerateQuiz, wrappedSaveQuiz, wrappedDiscardQuiz } = useQuizActionWrappers(
    mockHandleGenerateQuiz,
    mockHandleSaveQuiz,
    mockHandleDiscardQuiz,
    mockResetPreview,
    mockSetExistingQuiz,
    mockSetIsPublished,
    mockSetShowPreview,
    mockSetContentLoading
  );
  
  const { processQuizData } = useQuizDataProcessor();

  const generateQuizFromPrompt = useCallback(async (numQuestionsParam: string) => {
    try {
      // Reset states
      setGenerationPhase('loading');
      setLoadingError(null);

      // Generate quiz using the provided function
      setGenerationPhase('generating');
      
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
        const processedQuestions = await processQuizData(result.questions);
        setQuizQuestions(processedQuestions);
        setGenerationPhase('complete');
        return result;
      } else {
        // Handle failure
        setGenerationPhase('error');
        setLoadingError("Failed to generate quiz questions.");
        return null;
      }
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setGenerationPhase('error');
      setLoadingError(error.message || "An unexpected error occurred");
      return null;
    }
  }, [generateSmartQuiz, processQuizData, setGenerationPhase, setLoadingError]);

  return {
    generateQuizFromPrompt,
    loading,
    isRetrying,
    contentLoadingMessage,
    loadingError,
    numQuestions,
    setNumQuestions,
    quizQuestions,
    setExistingQuiz: (value: boolean) => {},
  };
};
