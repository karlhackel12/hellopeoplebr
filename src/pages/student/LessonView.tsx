
import React, { useEffect } from 'react';
import { useViewLesson } from './hooks/useViewLesson';
import LessonLoadingState from './components/lesson/LessonLoadingState';
import LessonErrorState from './components/lesson/LessonErrorState';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';
import LessonQuizDuolingo from '@/components/student/LessonQuizDuolingo';

interface LessonUnit {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  status: "completed" | "locked" | "available" | "in_progress";
  content?: any;
  questions?: any[];
  progress?: number;
  isQuizSuccessful?: boolean;
}

interface LessonSection {
  id: string;
  title: string;
  completed: boolean;
  units: LessonUnit[];
}

const LessonView: React.FC = () => {
  const { trackEvent } = useAnalytics();
  
  const lessonContext = useViewLesson();
  
  const {
    lesson,
    lessonId,
    lessonLoading,
    progressLoading,
    isUpdating,
    
    currentSectionIndex,
    sections,
    handleMarkLessonComplete,
    handleBack,
    
    completedSections,
    isLessonComplete,
    
    assignment,
    
    hasQuiz,
    isQuizAvailable,
    quiz,
    quizQuestions,
    
    // Duolingo specific props
    viewMode,
    setViewMode,
    convertQuizQuestionsToDuolingoFormat
  } = lessonContext;
  
  // Track lesson view event
  useEffect(() => {
    if (!lessonLoading && lesson) {
      trackEvent(ANALYTICS_EVENTS.STUDENT.LESSON_STARTED, {
        lesson_id: lessonId,
        lesson_title: lesson.title,
        is_assignment: !!assignment,
        has_quiz: hasQuiz
      });
    }
  }, [lessonLoading, lesson, lessonId, assignment, hasQuiz, trackEvent]);

  // Enhanced lesson completion with analytics
  const handleLessonComplete = async (unitId: string, success: boolean) => {
    trackEvent(ANALYTICS_EVENTS.STUDENT.LESSON_COMPLETED, {
      lesson_id: lessonId,
      success: success,
      unit_id: unitId
    });
    
    await handleMarkLessonComplete();
  };
  
  // Converter dados da lição para o formato necessário do caminho de aprendizado
  const convertToPathwaySections = () => {
    // Criar uma seção principal para a lição atual
    const lessonSections: LessonSection[] = [{
      id: 'main-section',
      title: 'Lição Principal',
      completed: isLessonComplete,
      units: [
        // Unidade para a lição
        {
          id: lessonId || 'lesson',
          title: lesson?.title || 'Lição',
          type: 'lesson',
          status: isLessonComplete ? 'completed' : 'available',
          progress: completedSections.length / (sections.length || 1) * 100,
          content: lesson?.content,
          questions: []
        } as LessonUnit,
        // Unidade para o quiz, se disponível
        ...(isQuizAvailable ? [{
          id: quiz?.id || 'quiz',
          title: quiz?.title || 'Quiz da Lição',
          type: 'quiz',
          status: isLessonComplete ? 'available' : 'locked',
          isQuizSuccessful: false,
          questions: quizQuestions || []
        } as LessonUnit] : [])
      ]
    }];

    return lessonSections;
  };
  
  // Show loading state
  if (lessonLoading || progressLoading) {
    return <LessonLoadingState />;
  }
  
  // Show error state if lesson not found
  if (!lesson) {
    return <LessonErrorState />;
  }
  
  return (
    <div className="container mx-auto py-6">
      <LessonQuizDuolingo
        lessonId={lessonId || ''}
        lessonTitle={lesson.title}
        sections={convertToPathwaySections()}
        onComplete={handleLessonComplete}
        onBack={handleBack}
      />
    </div>
  );
};

export default LessonView;
