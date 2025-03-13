
import { useState, useEffect } from 'react';
import { Question } from '../quiz/types';
import { useQuizHandler } from './useQuizHandler';
import { toast } from 'sonner';

export const useQuizTabState = (lessonId?: string) => {
  const [numQuestions, setNumQuestions] = useState<string>('5');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [contentLoadingMessage, setContentLoadingMessage] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'loading' | 'analyzing' | 'generating' | 'processing' | 'complete' | 'error'>('idle');

  const {
    fetchLessonContent,
    generateSmartQuiz,
    fetchQuizQuestions,
    fetchQuizDetails,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading,
    saving,
    isRetrying,
    error
  } = useQuizHandler(lessonId || '');

  useEffect(() => {
    if (lessonId) {
      loadExistingQuizData();
    }
  }, [lessonId]);

  useEffect(() => {
    if (error) {
      setLoadingError(`Error generating quiz: ${error}`);
      setErrorDetails(null);
      setCurrentPhase('error');
    }
  }, [error]);

  const loadExistingQuizData = async () => {
    if (!lessonId) return;
    
    try {
      const quizDetails = await fetchQuizDetails();
      if (quizDetails) {
        setExistingQuiz(true);
        setQuizTitle(quizDetails.title);
        setIsPublished(quizDetails.is_published || false);
        
        const questions = await fetchQuizQuestions();
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
        }
      }
    } catch (error) {
      console.error("Error loading existing quiz data:", error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!lessonId) {
      toast.error("Lesson ID is required to generate a quiz");
      return;
    }
    
    try {
      setLoadingError(null);
      setErrorDetails(null);
      setCurrentPhase('loading');
      setContentLoadingMessage('Analyzing lesson content...');
      
      // Set loading phases
      setTimeout(() => {
        if (currentPhase === 'loading') {
          setCurrentPhase('analyzing');
          setContentLoadingMessage('Creating quiz questions based on lesson content...');
        }
      }, 1500);
      
      setTimeout(() => {
        if (currentPhase === 'analyzing') {
          setCurrentPhase('generating');
          setContentLoadingMessage('Finalizing quiz questions and options...');
        }
      }, 3000);
      
      await generateSmartQuiz(parseInt(numQuestions));
      
      setCurrentPhase('complete');
      
      // Refresh the quiz data
      await loadExistingQuizData();
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setLoadingError(`Failed to generate quiz: ${error.message}`);
      setErrorDetails(error.stack || null);
      setCurrentPhase('error');
    }
  };

  const handleSaveQuiz = async (title: string) => {
    if (!lessonId || previewQuestions.length === 0) return;
    
    try {
      await saveQuizTitle(title, previewQuestions);
      toast.success('Quiz saved successfully');
      setExistingQuiz(true);
      await loadExistingQuizData();
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error(`Failed to save quiz: ${error.message}`);
    }
  };

  const handleDiscardQuiz = async () => {
    if (!lessonId) return;
    
    try {
      if (existingQuiz) {
        await deleteQuiz();
        toast.success('Quiz deleted successfully');
        setPreviewQuestions([]);
        setExistingQuiz(false);
      } else {
        // Just clear the preview without database operations
        setPreviewQuestions([]);
      }
    } catch (error: any) {
      console.error("Error discarding quiz:", error);
      toast.error(`Failed to discard quiz: ${error.message}`);
    }
  };

  const togglePublishStatus = async () => {
    if (!lessonId || !existingQuiz) return;
    
    try {
      if (isPublished) {
        await unpublishQuiz();
        setIsPublished(false);
        toast.success('Quiz unpublished');
      } else {
        await publishQuiz();
        setIsPublished(true);
        toast.success('Quiz published');
      }
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error(`Failed to update publish status: ${error.message}`);
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
    errorDetails,
    contentLoadingMessage,
    currentPhase,
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  };
};
