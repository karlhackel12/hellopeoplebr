
import { useState, useEffect } from 'react';
import { Question } from '../quiz/types';
import { QuizQuestionData } from '../quiz/types/quizGeneration';
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
    setIsRetrying: setRetrying
  } = useQuizGenerationState();
  
  // Quiz generation workflow
  const {
    generateQuizFromPrompt,
    quizQuestions,
    loading,
    setExistingQuiz: setWorkflowExistingQuiz = () => {}
  } = useQuizGenerationWorkflow();
  
  // Update preview whenever quiz questions change
  useEffect(() => {
    if (quizQuestions && quizQuestions.length > 0) {
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
        if (setWorkflowExistingQuiz) {
          setWorkflowExistingQuiz(true);
        }
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

  // Handle quiz generation - now accepts pre-existing questions
  const handleGenerateQuiz = async (numQuestionsParam: string, existingQuestions?: any[]) => {
    try {
      // If we have existing questions from localStorage, use those
      if (existingQuestions && existingQuestions.length > 0) {
        console.log("Using pre-existing questions from localStorage:", existingQuestions.length);
        setPreviewQuestions(existingQuestions);
        setShowPreview(true);
        return true;
      }
      
      // Otherwise, generate new questions
      console.log("Generating new questions from prompt");
      const result = await generateQuizFromPrompt(numQuestionsParam);
      if (result) {
        setShowPreview(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setError(error.message || "Failed to generate quiz");
      return false;
    }
  };
  
  // Handle quiz saving
  const handleSaveQuiz = async (title: string = quizTitle) => {
    if (!lessonId || previewQuestions.length === 0) return;
    
    try {
      setSaving(true);
      
      const existingQuiz = await QuizService.getExistingQuiz(lessonId);
      const quiz = await QuizService.saveQuiz(lessonId, title, existingQuiz?.id);
      
      // Clear existing questions if there are any
      if (existingQuiz?.id) {
        await QuizService.clearExistingQuestions(existingQuiz.id);
      }
      
      // Convert previewQuestions to QuizQuestionData format
      const quizQuestionData: QuizQuestionData[] = previewQuestions.map(question => {
        return {
          question_text: question.question_text,
          question_type: question.question_type || 'multiple_choice',
          points: question.points || 1,
          options: question.options ? question.options.map(option => ({
            option_text: option.option_text,
            is_correct: option.is_correct
          })) : []
        };
      });
      
      // Save the questions
      await QuizService.saveQuestions(quiz.id, quizQuestionData);
      
      toast.success('Quiz saved successfully');
      setExistingQuiz(true);
      await loadExistingQuizData();
      
      // Clear localStorage quiz data since we've saved it to the database
      const mostRecentQuizKey = localStorage.getItem('most_recent_quiz_key');
      if (mostRecentQuizKey) {
        localStorage.removeItem(mostRecentQuizKey);
        localStorage.removeItem('most_recent_quiz_key');
      }
      
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
        if (setWorkflowExistingQuiz) {
          setWorkflowExistingQuiz(false);
        }
      } else {
        // Just clear the preview without database operations
        setPreviewQuestions([]);
      }
      
      // Clear localStorage quiz data since we've discarded it
      const mostRecentQuizKey = localStorage.getItem('most_recent_quiz_key');
      if (mostRecentQuizKey) {
        localStorage.removeItem(mostRecentQuizKey);
        localStorage.removeItem('most_recent_quiz_key');
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
