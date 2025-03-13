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
    getQuizContent,
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
    getQuizContent,
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

  const { togglePublishStatus: originalTogglePublishStatus } = useQuizPublishState(
    publishQuizWithVoid, 
    unpublishQuizWithVoid, 
    isPublished, 
    setIsPublished
  );

  const togglePublishStatus = async (): Promise<void> => {
    try {
      await originalTogglePublishStatus();
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const {
    handleSaveQuiz,
    handleDiscardQuiz,
    handleGenerateQuiz
  } = useQuizActions(
    lessonId, 
    saveQuizTitle, 
    deleteQuiz, 
    generateSmartQuiz, 
    getQuizContent,
    fetchQuizQuestions
  );

  const wrappedHandleGenerateQuiz = async (setContentLoadingMessage: (msg: string) => void): Promise<boolean> => {
    try {
      await handleGenerateQuiz(setContentLoadingMessage);
      return true;
    } catch (error) {
      console.error("Error in wrappedHandleGenerateQuiz:", error);
      return false;
    }
  };

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
