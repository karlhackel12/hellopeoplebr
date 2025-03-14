
import { useState } from "react";
import { useQuizGenerationState } from "./useQuizGenerationState";
import { QuizGenerationResponse } from "../../quiz/types/quizGeneration";

export const useSmartQuizGeneration = () => {
  const { isRetrying, setIsRetrying } = useQuizGenerationState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSmartQuiz = async (
    generateQuizFunc: (numQuestions?: number) => Promise<QuizGenerationResponse>,
    numQuestions?: number
  ) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await generateQuizFunc(numQuestions);
      
      return response;
    } catch (err: any) {
      console.error("Smart quiz generation error:", err);
      setError(err.message || "Failed to generate quiz. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSmartQuiz,
    loading,
    error,
    isRetrying,
    setIsRetrying
  };
};
