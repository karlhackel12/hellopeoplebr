
import { useState, useCallback } from 'react';
import { Question } from '../../quiz/types';

export const useQuizPreviewState = (
  existingQuiz: boolean,
  fetchQuizQuestions: () => Promise<Question[] | null>
) => {
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');

  const loadQuizPreview = useCallback(async () => {
    if (existingQuiz) {
      try {
        const questions = await fetchQuizQuestions();
        if (questions) {
          setPreviewQuestions(questions);
          setShowPreview(true);
        }
      } catch (error) {
        console.error('Error loading quiz preview:', error);
      }
    }
  }, [existingQuiz, fetchQuizQuestions]);

  const resetPreview = useCallback(() => {
    setPreviewQuestions([]);
    setShowPreview(false);
    setQuizTitle('Lesson Quiz');
  }, []);

  return {
    previewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    loadQuizPreview,
    resetPreview
  };
};
