
import { useState, useEffect } from 'react';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { useQuizPreviewState } from './quiz/useQuizPreviewState';
import { useQuizGenerationState } from './quiz/useQuizGenerationState';
import { useQuizPublishState } from './quiz/useQuizPublishState';
import { useQuizActions } from './quiz/useQuizActions';
import { useQuizGenerationWorkflow } from './quiz/useQuizGenerationWorkflow';
import { useQuizExistingData } from './quiz/useQuizExistingData';
import { useQuizActionWrappers } from './quiz/useQuizActionWrappers';
import { GenerationPhase } from '../lesson/quiz/components/QuizGenerationProgress';

export const useQuizTabState = (lessonId?: string) => {
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [numQuestions, setNumQuestions] = useState('5');
  const [isPublished, setIsPublished] = useState(false);

  const { 
    generateSmartQuiz,
    fetchQuizQuestions, 
    fetchQuizDetails,
    fetchLessonContent,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading, 
    saving,
    isRetrying: isGenerationRetrying,
    error: quizError 
  } = useQuizHandler(lessonId || '');

  const {
    loadingError,
    setLoadingError,
    errorDetails,
    setErrorDetails,
    clearErrors,
    isRetrying,
    setRetrying,
    contentLoadingMessage,
    setContentLoading,
    currentPhase,
    setGenerationPhase,
    setError
  } = useQuizGenerationState();

  const {
    previewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    loadQuizPreview,
    resetPreview
  } = useQuizPreviewState(existingQuiz, fetchQuizQuestions);

  const { generateQuiz } = useQuizGenerationWorkflow(
    fetchLessonContent,
    generateSmartQuiz,
    loadQuizPreview,
    setExistingQuiz,
    setIsPublished,
    currentPhase,
    setGenerationPhase,
    setError,
    clearErrors,
    setContentLoading
  );

  // Setup quiz existing data check
  useQuizExistingData(lessonId, setExistingQuiz, setIsPublished, loadQuizPreview);

  const publishQuizWithVoid = async (): Promise<void> => {
    try {
      await publishQuiz();
    } catch (error) {
      console.error("Error publishing quiz:", error);
    }
  };

  const unpublishQuizWithVoid = async (): Promise<void> => {
    try {
      await unpublishQuiz();
    } catch (error) {
      console.error("Error unpublishing quiz:", error);
    }
  };

  const { togglePublishStatus } = useQuizPublishState(
    publishQuizWithVoid, 
    unpublishQuizWithVoid, 
    isPublished, 
    setIsPublished
  );

  const {
    handleSaveQuiz,
    handleDiscardQuiz,
    handleGenerateQuiz
  } = useQuizActions(
    lessonId, 
    saveQuizTitle, 
    deleteQuiz, 
    generateSmartQuiz, 
    fetchLessonContent,
    fetchQuizQuestions
  );

  // Create a wrapped version of handleGenerateQuiz that implements the expected interface
  const wrappedHandleGenerateQuiz = async (setContentLoadingMessage: (msg: string | null) => void): Promise<void> => {
    try {
      await handleGenerateQuiz(setContentLoadingMessage);
    } catch (error) {
      console.error("Error in wrappedHandleGenerateQuiz:", error);
    }
  };

  // This wrapper just calls the generate function without the message setter
  const generateQuizWrapper = async (): Promise<void> => {
    try {
      await generateQuiz(numQuestions);
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
  };

  const {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  } = useQuizActionWrappers(
    wrappedHandleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    resetPreview,
    setExistingQuiz,
    setIsPublished,
    setShowPreview,
    setContentLoading
  );

  useEffect(() => {
    setRetrying(isGenerationRetrying);
  }, [isGenerationRetrying, setRetrying]);

  return {
    numQuestions,
    setNumQuestions,
    previewQuestions,
    showPreview,
    setShowPreview,
    quizTitle,
    setQuizTitle,
    existingQuiz,
    isPublished,
    loading,
    saving,
    isRetrying,
    loadingError,
    errorDetails,
    contentLoadingMessage,
    currentPhase,
    handleGenerateQuiz: generateQuizWrapper,
    handleSaveQuiz: wrappedSaveQuiz,
    handleDiscardQuiz: wrappedDiscardQuiz,
    togglePublishStatus,
  };
};
