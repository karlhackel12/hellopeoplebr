
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

  // Handle generating quiz workflow
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

  // Load existing quiz data on mount
  useQuizExistingData(
    lessonId,
    fetchQuizDetails,
    setExistingQuiz,
    setQuizTitle,
    setIsPublished,
    loadQuizPreview,
    setLoadingError
  );

  // Set up publish/unpublish handling with fixed return types
  const publishQuizWithResult = async (): Promise<boolean> => {
    try {
      await publishQuiz();
      return true;
    } catch (error) {
      return false;
    }
  };

  const unpublishQuizWithResult = async (): Promise<boolean> => {
    try {
      await unpublishQuiz();
      return true;
    } catch (error) {
      return false;
    }
  };

  const { togglePublishStatus } = useQuizPublishState(
    publishQuizWithResult, 
    unpublishQuizWithResult, 
    isPublished, 
    setIsPublished
  );

  // Set up quiz action handlers (save, discard, generate)
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

  // Create wrapped handlers with proper return types
  const {
    wrappedGenerateQuiz,
    wrappedSaveQuiz,
    wrappedDiscardQuiz
  } = useQuizActionWrappers(
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    resetPreview,
    setExistingQuiz,
    setIsPublished,
    setShowPreview,
    setContentLoading
  );

  // Sync retrying state with handler
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
    handleGenerateQuiz: () => generateQuiz(numQuestions),
    handleSaveQuiz: wrappedSaveQuiz,
    handleDiscardQuiz: wrappedDiscardQuiz,
    togglePublishStatus,
  };
};
