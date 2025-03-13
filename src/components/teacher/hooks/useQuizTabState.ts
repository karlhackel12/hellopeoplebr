
import { useState, useEffect } from 'react';
import { Question } from '../quiz/types';
import { toast } from 'sonner';
import { GenerationPhase } from '../quiz/types/quizGeneration';
import { useQuizGenerationState } from './quiz/useQuizGenerationState';
import { useQuizGenerationWorkflow } from './quiz/useQuizGenerationWorkflow';
import { QuizService } from '../quiz/services/QuizService';

export const useQuizTabState = (lessonId?: string) => {
  // Basic state
  const [numQuestions, setNumQuestions] = useState<string>('5');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [quizTitle, setQuizTitle] = useState<string>('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Quiz generation state management
  const {
    loadingError,
    errorDetails,
    setError,
    clearErrors,
    contentLoadingMessage,
    currentPhase,
    setGenerationPhase,
    isRetrying,
    setRetrying
  } = useQuizGenerationState();
  
  // Quiz generation workflow
  const {
    handleGenerateQuiz,
    quizQuestions,
    loading,
    setExistingQuiz: setWorkflowExistingQuiz
  } = useQuizGenerationWorkflow(lessonId || '', setGenerationPhase, setError, clearErrors);
  
  // Update preview whenever quiz questions change
  useEffect(() => {
    if (quizQuestions.length > 0) {
      setPreviewQuestions(quizQuestions);
    }
  }, [quizQuestions]);
  
  // Check for existing quiz when component loads
  useEffect(() => {
    if (lessonId) {
      loadExistingQuizData();
    }
  }, [lessonId]);
  
  // Load existing quiz data
  const loadExistingQuizData = async () => {
    if (!lessonId) return;
    
    try {
      const quizDetails = await QuizService.getExistingQuiz(lessonId);
      
      if (quizDetails) {
        setExistingQuiz(true);
        setWorkflowExistingQuiz(true);
        setQuizTitle(quizDetails.title);
        setIsPublished(quizDetails.is_published || false);
        
        const questions = await QuizService.getQuizQuestions(quizDetails.id);
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
        }
      }
    } catch (error) {
      console.error("Error loading existing quiz data:", error);
    }
  };
  
  // Handle quiz saving
  const handleSaveQuiz = async (title: string) => {
    if (!lessonId || previewQuestions.length === 0) return;
    
    try {
      setSaving(true);
      
      const existingQuiz = await QuizService.getExistingQuiz(lessonId);
      await QuizService.saveQuiz(lessonId, title, existingQuiz?.id);
      
      toast.success('Quiz saved successfully');
      setExistingQuiz(true);
      await loadExistingQuizData();
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      toast.error(`Failed to save quiz: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle discarding a quiz
  const handleDiscardQuiz = async () => {
    if (!lessonId) return;
    
    try {
      setSaving(true);
      
      if (existingQuiz) {
        const quizDetails = await QuizService.getExistingQuiz(lessonId);
        if (quizDetails) {
          await QuizService.deleteQuiz(quizDetails.id);
          toast.success('Quiz deleted successfully');
        }
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setWorkflowExistingQuiz(false);
      } else {
        // Just clear the preview without database operations
        setPreviewQuestions([]);
      }
    } catch (error: any) {
      console.error("Error discarding quiz:", error);
      toast.error(`Failed to discard quiz: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle toggling publish status
  const togglePublishStatus = async () => {
    if (!lessonId || !existingQuiz) return;
    
    try {
      setSaving(true);
      
      const quizDetails = await QuizService.getExistingQuiz(lessonId);
      if (!quizDetails) {
        toast.error('Quiz not found');
        return;
      }
      
      await QuizService.updatePublishStatus(quizDetails.id, !isPublished);
      setIsPublished(!isPublished);
      
      toast.success(isPublished ? 'Quiz unpublished' : 'Quiz published');
    } catch (error: any) {
      console.error("Error toggling publish status:", error);
      toast.error(`Failed to update publish status: ${error.message}`);
    } finally {
      setSaving(false);
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
