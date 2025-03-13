
import { useState, useCallback } from 'react';
import { useQuizHandler } from './useQuizHandler';
import { Quiz, Question } from '@/components/teacher/quiz/types';

export const useQuizTabState = (lessonId: string, isEditMode: boolean = false) => {
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [contentLoadingMessage, setContentLoadingMessage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const {
    fetchLessonContent,
    generateSmartQuiz,
    generateQuiz,
    fetchQuizQuestions,
    fetchQuizDetails,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading: apiLoading,
    saving,
    isRetrying,
    error
  } = useQuizHandler(lessonId);

  const loadQuizDetails = useCallback(async () => {
    try {
      setLoading(true);
      const quiz = await fetchQuizDetails();
      
      if (quiz) {
        setQuizTitle(quiz.title);
        setExistingQuiz(true);
        setQuizDetails(quiz);
        setIsPublished(quiz.is_published);
        
        // Load questions if quiz exists
        const questions = await fetchQuizQuestions();
        if (questions.length > 0) {
          setPreviewQuestions(questions);
        }
      } else {
        setExistingQuiz(false);
        setQuizDetails(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error loading quiz details:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchQuizDetails, fetchQuizQuestions]);

  const handleGenerateQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setShowPreview(false);
      
      const questions = await generateQuiz();
      if (questions && questions.length > 0) {
        setPreviewQuestions(questions);
        setShowPreview(true);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [generateQuiz]);

  const handleSmartGeneration = useCallback(async () => {
    setLoading(true);
    setShowPreview(false);
    try {
      // Void the return value to make it compatible with Promise<void>
      await generateSmartQuiz((msg) => {
        if (msg) {
          setContentLoadingMessage(msg);
        } else {
          setContentLoadingMessage(null);
        }
      });
      return;
    } catch (err) {
      console.error('Smart generation failed:', err);
      return;
    } finally {
      setLoading(false);
    }
  }, [generateSmartQuiz]);

  const handleGenerateFromLesson = useCallback(async (setMessage: (msg: string) => void) => {
    try {
      setContentLoaded(false);
      
      const content = await fetchLessonContent(setMessage);
      setContentLoaded(!!content);
      
      return !!content; // Return boolean indicating success
    } catch (err) {
      console.error('Failed to load lesson content:', err);
      return false;
    }
  }, [fetchLessonContent]);

  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const handleSaveQuiz = useCallback(async (title: string) => {
    try {
      await saveQuizTitle(title, previewQuestions);
      setExistingQuiz(true);
      await loadQuizDetails();
    } catch (err) {
      console.error('Failed to save quiz:', err);
    }
  }, [saveQuizTitle, previewQuestions, loadQuizDetails]);

  const handleDiscardQuiz = useCallback(async () => {
    try {
      if (existingQuiz && quizDetails?.id) {
        await deleteQuiz(quizDetails.id);
        setExistingQuiz(false);
        setQuizDetails(null);
        setShowPreview(false);
        setPreviewQuestions([]);
        setQuizTitle('');
      } else {
        setShowPreview(false);
        setPreviewQuestions([]);
        setQuizTitle('');
      }
    } catch (err) {
      console.error('Failed to discard quiz:', err);
    }
  }, [existingQuiz, quizDetails, deleteQuiz]);
  
  const handleTogglePublish = useCallback(async () => {
    if (!quizDetails?.id) return;
    
    try {
      if (isPublished) {
        await unpublishQuiz(quizDetails.id);
      } else {
        await publishQuiz(quizDetails.id);
      }
      setIsPublished(!isPublished);
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  }, [quizDetails, isPublished, publishQuiz, unpublishQuiz]);

  return {
    quizTitle,
    setQuizTitle,
    loading: loading || apiLoading,
    saving,
    previewQuestions,
    showPreview,
    togglePreview,
    existingQuiz,
    isPublished,
    contentLoaded,
    contentLoadingMessage,
    isRetrying,
    error,
    handleGenerateQuiz,
    handleSmartGeneration,
    handleGenerateFromLesson,
    handleSaveQuiz,
    handleDiscardQuiz,
    handleTogglePublish,
    loadQuizDetails
  };
};
