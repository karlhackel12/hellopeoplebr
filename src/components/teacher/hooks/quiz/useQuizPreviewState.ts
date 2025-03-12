
import { useState } from 'react';
import { Question } from '../../quiz/types';
import { toast } from 'sonner';

export const useQuizPreviewState = (
  existingQuiz: boolean,
  fetchQuizQuestions: () => Promise<Question[] | null>
) => {
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');

  const loadQuizPreview = async () => {
    try {
      const questions = await fetchQuizQuestions();
      
      if (questions && questions.length > 0) {
        setPreviewQuestions(questions);
        setShowPreview(true);
      }
      return questions;
    } catch (error: any) {
      console.error("Error loading quiz preview:", error);
      return null;
    }
  };

  const resetPreview = () => {
    setShowPreview(false);
    setPreviewQuestions([]);
  };

  return {
    previewQuestions,
    setPreviewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    loadQuizPreview,
    resetPreview
  };
};
