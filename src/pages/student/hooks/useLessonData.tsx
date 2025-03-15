
import { useLesson, useQuiz, useQuizQuestions, useViewLesson } from './lesson';

export const useLessonData = (lessonId: string | undefined) => {
  // Get lesson data
  const { 
    data: lesson, 
    isLoading: lessonLoading, 
    error: lessonError 
  } = useLesson(lessonId);
  
  // Get quiz data
  const { 
    data: quiz, 
    isLoading: quizLoading, 
    error: quizError 
  } = useQuiz(lessonId);
  
  // Get quiz questions if quiz exists and is published
  const { 
    data: quizQuestions = [], 
    isLoading: questionsLoading, 
    error: questionsError 
  } = useQuizQuestions(quiz?.id, quiz?.is_published);
  
  // Mark lesson as viewed
  useViewLesson(lessonId, lessonLoading);
  
  // Log any errors
  const hasErrors = !!lessonError || !!quizError || !!questionsError;
  if (hasErrors) {
    console.error('Errors in useLessonData:', { lessonError, quizError, questionsError });
  }

  return {
    lesson,
    lessonLoading,
    quiz,
    quizLoading,
    quizQuestions,
    questionsLoading,
    hasQuiz: !!quiz && quiz.is_published === true,
    isQuizAvailable: !!quiz && quiz.is_published === true,
    hasUnpublishedQuiz: !!quiz && !quiz.is_published
  };
};
