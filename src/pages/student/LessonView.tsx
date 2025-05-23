
import React, { useEffect, useState } from 'react';
import { useViewLesson } from './hooks/useViewLesson';
import LessonLoadingState from './components/lesson/LessonLoadingState';
import LessonErrorState from './components/lesson/LessonErrorState';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';
import LessonQuizDuolingo from '@/components/student/LessonQuizDuolingo';
import LessonContainer from './components/lesson/LessonContainer';
import { supabase } from '@/integrations/supabase/client';

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
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  const [finalQuizScore, setFinalQuizScore] = useState<number | undefined>();
  
  console.log('LessonView: Component mounted');
  
  const lessonContext = useViewLesson();
  
  console.log('LessonView: Context data:', {
    hasLesson: !!lessonContext?.lesson,
    lessonId: lessonContext?.lessonId,
    loading: lessonContext?.lessonLoading,
    error: !lessonContext?.lesson && !lessonContext?.lessonLoading
  });
  
  // Check if lessonContext is available
  if (!lessonContext) {
    console.error('LessonView: No lesson context available');
    return <LessonErrorState />;
  }
  
  const {
    lesson,
    lessonId,
    lessonLoading,
    progressLoading,
    isUpdating,
    
    currentTab,
    setCurrentTab,
    currentSectionIndex,
    sections,
    goToSection,
    handleToggleSectionCompletion,
    goToPreviousSection,
    goToNextSection,
    handleBack,
    
    completedSections,
    isLessonComplete,
    handleMarkLessonComplete,
    
    assignment,
    
    hasQuiz,
    isQuizAvailable,
    quiz,
    quizQuestions,
    
    // Review mode
    isReviewMode,
    
    // Duolingo specific props
    viewMode,
    setViewMode,
    convertQuizQuestionsToDuolingoFormat
  } = lessonContext;
  
  console.log('LessonView: Lesson data:', {
    lessonTitle: lesson?.title,
    sectionsCount: sections?.length || 0,
    hasQuiz,
    isQuizAvailable,
    questionsCount: quizQuestions?.length || 0,
    isReviewMode
  });

  // Fetch quiz answers for completed lessons
  useEffect(() => {
    const fetchQuizAnswers = async () => {
      if (!isReviewMode || !quiz?.id || !lessonId) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get the latest quiz attempt for this lesson
        const { data: attempt, error: attemptError } = await supabase
          .from('user_quiz_attempts')
          .select('id, score')
          .eq('quiz_id', quiz.id)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attemptError) {
          console.error('Error fetching quiz attempt:', attemptError);
          return;
        }

        if (attempt) {
          setFinalQuizScore(attempt.score);

          // Get the answers for this attempt
          const { data: answers, error: answersError } = await supabase
            .from('user_quiz_answers')
            .select('question_id, selected_option_id')
            .eq('attempt_id', attempt.id);

          if (answersError) {
            console.error('Error fetching quiz answers:', answersError);
            return;
          }

          // Convert answers to the format expected by the review component
          const answersMap: Record<string, string> = {};
          answers?.forEach(answer => {
            if (answer.selected_option_id) {
              answersMap[answer.question_id] = answer.selected_option_id;
            }
          });

          setUserQuizAnswers(answersMap);
          console.log('LessonView: Loaded quiz answers for review:', answersMap);
        }
      } catch (error) {
        console.error('Error in fetchQuizAnswers:', error);
      }
    };

    fetchQuizAnswers();
  }, [isReviewMode, quiz?.id, lessonId]);
  
  // Track lesson view event
  useEffect(() => {
    if (!lessonLoading && lesson) {
      console.log('LessonView: Tracking lesson view event');
      trackEvent(ANALYTICS_EVENTS.STUDENT.LESSON_STARTED, {
        lesson_id: lessonId,
        lesson_title: lesson.title,
        is_assignment: !!assignment,
        has_quiz: hasQuiz,
        is_review_mode: isReviewMode
      });
    }
  }, [lessonLoading, lesson, lessonId, assignment, hasQuiz, trackEvent, isReviewMode]);

  // Enhanced lesson completion with analytics
  const handleLessonComplete = async (unitId: string, success: boolean) => {
    console.log('LessonView: Lesson completion attempt:', { unitId, success });
    
    trackEvent(ANALYTICS_EVENTS.STUDENT.LESSON_COMPLETED, {
      lesson_id: lessonId,
      success: success,
      unit_id: unitId
    });
    
    await handleMarkLessonComplete();
  };
  
  // Show loading state
  if (lessonLoading || progressLoading) {
    console.log('LessonView: Showing loading state');
    return <LessonLoadingState />;
  }
  
  // Show error state if lesson not found
  if (!lesson) {
    console.error('LessonView: No lesson found, showing error state');
    return <LessonErrorState />;
  }
  
  // Check if lesson has content
  if (!lesson.content && (!quizQuestions || quizQuestions.length === 0)) {
    console.warn('LessonView: Lesson has no content or questions');
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lição sem conteúdo</h2>
          <p className="text-muted-foreground mb-4">
            Esta lição ainda não possui conteúdo disponível.
          </p>
          <button onClick={handleBack} className="px-4 py-2 bg-primary text-primary-foreground rounded">
            Voltar às lições
          </button>
        </div>
      </div>
    );
  }
  
  console.log('LessonView: Rendering lesson component');
  
  // If using Duolingo view mode and not in review mode, use the Duolingo component
  if (viewMode === 'duolingo' && !isReviewMode) {
    // Converter dados da lição para o formato necessário do caminho de aprendizado
    const convertToPathwaySections = () => {
      console.log('LessonView: Converting to pathway sections');
      
      if (!lesson) {
        console.warn('LessonView: No lesson data available for conversion');
        return [];
      }
      
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

      console.log('LessonView: Converted sections:', lessonSections);
      return lessonSections;
    };

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
  }
  
  // Use standard lesson container view
  const totalPages = sections.length;
  const isFirstPage = currentSectionIndex === 0;
  const isLastPage = currentSectionIndex === totalPages - 1;
  const completionPercentage = totalPages > 0 
    ? Math.round((currentSectionIndex) / (totalPages - 1) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-6">
      <LessonContainer
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        completedSections={completedSections}
        goToSection={goToSection}
        onToggleSectionCompletion={handleToggleSectionCompletion}
        goToPreviousSection={goToPreviousSection}
        goToNextSection={goToNextSection}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        completionPercentage={completionPercentage}
        totalPages={totalPages}
        hasQuiz={hasQuiz}
        quizQuestions={quizQuestions || []}
        quizId={quiz?.id || ''}
        lessonId={lessonId || ''}
        quizTitle={quiz?.title || 'Quiz'}
        quizPassPercent={quiz?.pass_percent || 70}
        isReviewMode={isReviewMode}
        isLessonComplete={isLessonComplete}
        userQuizAnswers={userQuizAnswers}
        finalQuizScore={finalQuizScore}
      />
    </div>
  );
};

export default LessonView;
