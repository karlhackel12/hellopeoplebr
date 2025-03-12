
import { useState, useEffect } from 'react';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { useQuizPreviewState } from './quiz/useQuizPreviewState';
import { useQuizGenerationState } from './quiz/useQuizGenerationState';
import { useQuizPublishState } from './quiz/useQuizPublishState';
import { useQuizActions } from './quiz/useQuizActions';

export const useQuizTabState = (lessonId?: string) => {
  const [existingQuiz, setExistingQuiz] = useState(false);

  // Initialize the quiz handler
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

  // Initialize sub-hooks
  const {
    numQuestions,
    setNumQuestions,
    loadingError,
    setLoadingError,
    clearErrors,
    isRetrying,
    setRetrying,
    contentLoadingMessage,
    setContentLoading
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

  // Create custom publish/unpublish functions that return boolean
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

  const {
    isPublished,
    setIsPublished,
    togglePublishStatus
  } = useQuizPublishState(publishQuizWithResult, unpublishQuizWithResult);

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

  // Sync with external state
  useEffect(() => {
    setRetrying(isGenerationRetrying);
  }, [isGenerationRetrying]);

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          setLoadingError(null);
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            setIsPublished(quizDetails.is_published || false);
            
            await loadQuizPreview();
          }
        } catch (error: any) {
          console.error("Error checking existing quiz:", error);
          setLoadingError(error.message);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId]);

  // Wrap the action handlers to manage state properly
  const wrappedGenerateQuiz = async () => {
    setShowPreview(false);
    clearErrors();
    const success = await handleGenerateQuiz(numQuestions, setContentLoading);
    
    if (success) {
      await loadQuizPreview();
      setExistingQuiz(true);
      setIsPublished(false);
    }
  };

  const wrappedSaveQuiz = async () => {
    return await handleSaveQuiz(quizTitle);
  };

  const wrappedDiscardQuiz = async () => {
    const success = await handleDiscardQuiz();
    if (success) {
      resetPreview();
      setExistingQuiz(false);
      setIsPublished(false);
    }
  };

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
    contentLoadingMessage,
    handleGenerateQuiz: wrappedGenerateQuiz,
    handleSaveQuiz: wrappedSaveQuiz,
    handleDiscardQuiz: wrappedDiscardQuiz,
    togglePublishStatus,
  };
};
