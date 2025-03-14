
import { useState, useEffect } from 'react';
import { useQuizGenerationWorkflow } from './quiz/useQuizGenerationWorkflow';

export const useQuizHandler = (lessonId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizGenerated, setQuizGenerated] = useState(false);

  const {
    generateQuizFromPrompt,
    loading,
    isRetrying,
    contentLoadingMessage,
    loadingError,
    numQuestions,
    setNumQuestions,
  } = useQuizGenerationWorkflow();

  // Update local loading state based on workflow loading state
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Update local error state based on workflow error state
  useEffect(() => {
    setError(loadingError);
  }, [loadingError]);

  const handleGenerateQuiz = async (questionsCount: string) => {
    if (!lessonId) {
      setError("Lesson ID is required to generate a quiz");
      return;
    }

    try {
      const result = await generateQuizFromPrompt(questionsCount);
      if (result) {
        setQuizGenerated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz");
      return false;
    }
  };

  return {
    isLoading,
    error,
    quizGenerated,
    isRetrying,
    contentLoadingMessage,
    numQuestions,
    setNumQuestions,
    handleGenerateQuiz,
  };
};
