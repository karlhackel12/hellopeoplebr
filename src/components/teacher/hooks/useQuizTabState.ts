import { useState, useEffect } from 'react';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { useQuizPreviewState } from './quiz/useQuizPreviewState';
import { useQuizGenerationState } from './quiz/useQuizGenerationState';
import { useQuizPublishState } from './quiz/useQuizPublishState';
import { useQuizActions } from './quiz/useQuizActions';
import { GenerationPhase } from '../lesson/quiz/components/QuizGenerationProgress';

export const useQuizTabState = (lessonId?: string) => {
  const [existingQuiz, setExistingQuiz] = useState(false);

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
    numQuestions,
    setNumQuestions,
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

  useEffect(() => {
    setRetrying(isGenerationRetrying);
  }, [isGenerationRetrying]);

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

  const wrappedGenerateQuiz = async () => {
    setShowPreview(false);
    clearErrors();
    setGenerationPhase('content-loading');
    
    const onPhaseChange = (phase: GenerationPhase) => {
      setGenerationPhase(phase);
    };
    
    try {
      onPhaseChange('content-loading');
      const content = await fetchLessonContent();
      
      if (!content) {
        setError('Could not load lesson content', 'Make sure your lesson has sufficient content before generating a quiz.');
        return false;
      }
      
      if (content.length < 100) {
        setError('Lesson content too short', 'Your lesson needs more content to generate meaningful quiz questions.');
        return false;
      }

      onPhaseChange('analyzing');
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback
      
      onPhaseChange('generating');
      try {
        const success = await handleGenerateQuiz(numQuestions, setContentLoading);
        
        if (success) {
          onPhaseChange('saving');
          await loadQuizPreview();
          setExistingQuiz(true);
          setIsPublished(false);
          onPhaseChange('complete');
          
          setTimeout(() => {
            if (currentPhase === 'complete') {
              setGenerationPhase('idle');
            }
          }, 2000);
          
          return true;
        } else {
          setError('Failed to generate quiz', 'The quiz generation process failed. Please try again later.');
          return false;
        }
      } catch (genError: any) {
        console.error("Error during quiz generation:", genError);
        setError(
          genError.message || 'Quiz generation failed', 
          genError.details || 'An unexpected error occurred during quiz generation.'
        );
        return false;
      }
    } catch (error: any) {
      console.error("Error in quiz generation flow:", error);
      setError(
        'Quiz generation error', 
        error.message || 'An unexpected error occurred during the quiz generation process.'
      );
      return false;
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
    return success;
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
    errorDetails,
    contentLoadingMessage,
    currentPhase,
    handleGenerateQuiz: wrappedGenerateQuiz,
    handleSaveQuiz: wrappedSaveQuiz,
    handleDiscardQuiz: wrappedDiscardQuiz,
    togglePublishStatus,
  };
};
