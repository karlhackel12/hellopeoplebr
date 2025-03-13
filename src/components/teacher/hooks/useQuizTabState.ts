
import { useState, useEffect } from 'react';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { useQuizPreviewState } from './quiz/useQuizPreviewState';
import { useQuizGenerationState } from './quiz/useQuizGenerationState';
import { useQuizPublishState } from './quiz/useQuizPublishState';
import { useQuizExistingData } from './quiz/useQuizExistingData';
import { useQuizGenerationWorkflow } from './quiz/useQuizGenerationWorkflow';
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

  const { togglePublishStatus } = useQuizPublishState(
    publishQuiz, 
    unpublishQuiz, 
    isPublished, 
    setIsPublished
  );

  // Implementation of action wrappers to provide the expected interface
  const handleGenerateQuiz = async (): Promise<void> => {
    if (!lessonId) return;
    await generateQuiz(numQuestions);
  };

  const handleSaveQuiz = async (): Promise<void> => {
    if (!lessonId) return;
    await saveQuizTitle(quizTitle);
  };

  const handleDiscardQuiz = async (): Promise<void> => {
    if (!lessonId) return;
    try {
      await deleteQuiz();
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
      setShowPreview(false);
    } catch (error) {
      console.error("Error discarding quiz:", error);
    }
  };

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
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  };
};
