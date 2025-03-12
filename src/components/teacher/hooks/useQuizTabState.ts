
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { Question } from '../quiz/types';

export const useQuizTabState = (lessonId?: string) => {
  const [numQuestions, setNumQuestions] = useState('5');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const { 
    generateQuiz, 
    fetchQuizQuestions, 
    fetchQuizDetails,
    saveQuizTitle,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz,
    loading, 
    saving 
  } = useQuizHandler(lessonId || '');

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          const quizDetails = await fetchQuizDetails();
          
          if (quizDetails) {
            setExistingQuiz(true);
            setQuizTitle(quizDetails.title);
            setIsPublished(quizDetails.is_published || false);
            
            const questions = await fetchQuizQuestions();
            if (questions && questions.length > 0) {
              setPreviewQuestions(questions);
              setShowPreview(true);
            }
          }
        } catch (error) {
          console.error("Error checking existing quiz:", error);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId, fetchQuizQuestions, fetchQuizDetails]);

  const handleGenerateQuiz = async () => {
    if (!lessonId) {
      toast.error('Missing lesson', {
        description: 'Please save the lesson before generating a quiz.',
      });
      return;
    }
    
    try {
      setShowPreview(false);
      const result = await generateQuiz(parseInt(numQuestions));
      
      if (result) {
        const questions = await fetchQuizQuestions();
        
        if (questions && questions.length > 0) {
          setPreviewQuestions(questions);
          setShowPreview(true);
          setExistingQuiz(true);
          setIsPublished(false);
          toast.success('Quiz generated', {
            description: 'Your quiz questions have been generated. Review them below.',
          });
        } else {
          toast.error('No questions generated', {
            description: 'The quiz was created but no questions were generated. Please try again.',
          });
        }
      }
    } catch (error: any) {
      console.error("Error handling quiz generation:", error);
      toast.error('Generation failed', {
        description: 'Failed to generate quiz questions. Please try again.',
      });
    }
  };

  const handleSaveQuiz = async () => {
    await saveQuizTitle(quizTitle);
    toast.success('Quiz saved', {
      description: 'Your quiz has been saved successfully.',
    });
  };

  const handleDiscardQuiz = async () => {
    if (existingQuiz && window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const success = await deleteQuiz();
      if (success) {
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setShowPreview(false);
        setIsPublished(false);
        toast.success('Quiz deleted', {
          description: 'Your quiz has been deleted successfully.',
        });
      }
    } else if (!existingQuiz) {
      setShowPreview(false);
      setPreviewQuestions([]);
    }
  };

  const togglePublishStatus = async () => {
    if (!existingQuiz) {
      toast.error('Save quiz first', {
        description: 'You need to save the quiz before publishing it.',
      });
      return;
    }

    try {
      if (isPublished) {
        const success = await unpublishQuiz();
        if (success) {
          setIsPublished(false);
          toast.success('Quiz unpublished', {
            description: 'Your quiz is now hidden from students.',
          });
        }
      } else {
        const success = await publishQuiz();
        if (success) {
          setIsPublished(true);
          toast.success('Quiz published', {
            description: 'Your quiz is now visible to students.',
          });
        }
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error('Action failed', {
        description: 'Failed to change publish status. Please try again.',
      });
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
    handleGenerateQuiz,
    handleSaveQuiz,
    handleDiscardQuiz,
    togglePublishStatus,
  };
};
