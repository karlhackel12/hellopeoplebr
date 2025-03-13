
import { useState, useEffect } from 'react';
import { Question } from '../../quiz/types';

export const useQuizPreviewState = (
  existingQuiz: boolean,
  fetchQuizQuestions: () => Promise<Question[] | null>
) => {
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadQuizPreview = async (): Promise<Question[] | null> => {
    try {
      if (!existingQuiz) return [];
      
      setPreviewLoading(true);
      setPreviewError(null);
      
      const questions = await fetchQuizQuestions();
      
      if (questions) {
        setPreviewQuestions(questions);
        return questions;
      } else {
        setPreviewError('Failed to load quiz questions');
        return null;
      }
    } catch (error: any) {
      console.error("Error loading quiz preview:", error);
      setPreviewError(error.message || 'An unexpected error occurred');
      return null;
    } finally {
      setPreviewLoading(false);
    }
  };

  const resetPreview = () => {
    setPreviewQuestions([]);
    setQuizTitle('Lesson Quiz');
  };

  // Load quiz when existingQuiz changes
  useEffect(() => {
    if (existingQuiz) {
      loadQuizPreview();
    }
  }, [existingQuiz]);

  return {
    previewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    loadQuizPreview,
    resetPreview,
    previewLoading,
    previewError
  };
};
