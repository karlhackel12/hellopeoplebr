
import { useLesson, useQuiz, useQuizQuestions, useViewLesson } from './lesson';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useLessonData = (lessonId: string | undefined) => {
  // Get lesson data
  const { 
    data: lesson, 
    isLoading: lessonLoading, 
    error: lessonError,
    isError: isLessonError
  } = useLesson(lessonId);
  
  // Get quiz data
  const { 
    data: quiz, 
    isLoading: quizLoading, 
    error: quizError,
    isError: isQuizError
  } = useQuiz(lessonId);
  
  // Get quiz questions if quiz exists and is published
  const { 
    data: quizQuestions = [], 
    isLoading: questionsLoading, 
    error: questionsError,
    isError: isQuestionsError
  } = useQuizQuestions(quiz?.id, quiz?.is_published);
  
  // Mark lesson as viewed
  useViewLesson(lessonId, lessonLoading);

  // Show user-friendly error toasts when errors occur
  useEffect(() => {
    if (isLessonError) {
      toast.error('Erro ao carregar a lição', {
        description: 'Não foi possível carregar o conteúdo da lição.'
      });
      console.error('Lesson error:', lessonError);
    }
    
    if (isQuizError && !isLessonError) {
      toast.error('Erro ao carregar o quiz', {
        description: 'A lição foi carregada, mas houve um problema com o quiz.'
      });
      console.error('Quiz error:', quizError);
    }
    
    if (isQuestionsError && !isLessonError && !isQuizError) {
      toast.error('Erro ao carregar as questões do quiz', {
        description: 'Houve um problema ao carregar as questões do quiz.'
      });
      console.error('Questions error:', questionsError);
    }
  }, [isLessonError, isQuizError, isQuestionsError, lessonError, quizError, questionsError]);
  
  // Aggregate loading and error states
  const isLoading = lessonLoading || quizLoading || questionsLoading;
  const hasErrors = isLessonError || isQuizError || isQuestionsError;

  return {
    lesson,
    lessonLoading,
    quiz,
    quizLoading,
    quizQuestions,
    questionsLoading,
    hasQuiz: !!quiz && quiz.is_published === true,
    isQuizAvailable: !!quiz && quiz.is_published === true,
    hasUnpublishedQuiz: !!quiz && !quiz.is_published,
    isLoading,
    hasErrors
  };
};
