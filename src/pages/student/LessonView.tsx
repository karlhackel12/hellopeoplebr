
import React, { useEffect } from 'react';
import { Separator } from "@/components/ui/separator";
import { useViewLesson } from './hooks/useViewLesson';
import LessonHeader from './components/LessonHeader';
import LessonContainer from './components/lesson/LessonContainer';
import AssignmentAlert from './components/lesson/AssignmentAlert';
import UnpublishedQuizAlert from './components/lesson/UnpublishedQuizAlert';
import LessonLoadingState from './components/lesson/LessonLoadingState';
import LessonErrorState from './components/lesson/LessonErrorState';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

const LessonView: React.FC = () => {
  const { trackEvent } = useAnalytics();
  
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
    goToPreviousSection,
    goToNextSection,
    handleBack,
    
    completedSections,
    isLessonComplete,
    handleToggleSectionCompletion,
    handleMarkLessonComplete,
    
    assignment,
    
    hasQuiz,
    isQuizAvailable,
    hasUnpublishedQuiz,
    quiz,
    quizQuestions,
    
    totalPages,
    isFirstPage,
    isLastPage,
    completionPercentage
  } = useViewLesson();
  
  // Track lesson view and completion events
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

  // Track tab changes
  const handleTabChange = (tab: 'content' | 'quiz') => {
    setCurrentTab(tab);
    
    trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
      page: `lesson_${tab}`,
      lesson_id: lessonId
    });
  };

  // Enhanced section navigation with analytics
  const handleGoToSection = (index: number) => {
    trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
      action: 'go_to_section',
      section_index: index,
      lesson_id: lessonId
    });
    
    goToSection(index);
  };

  // Enhanced section completion toggle with analytics
  const handleSectionCompletion = (sectionTitle: string) => {
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: completedSections.includes(sectionTitle) ? 'mark_section_incomplete' : 'mark_section_complete',
      section_id: sectionTitle,
      lesson_id: lessonId
    });
    
    handleToggleSectionCompletion(sectionTitle);
  };

  // Enhanced lesson completion with analytics
  const markLessonComplete = async () => {
    trackEvent(ANALYTICS_EVENTS.STUDENT.LESSON_COMPLETED, {
      lesson_id: lessonId,
      completion_percentage: completionPercentage,
      completed_sections: completedSections.length,
      total_sections: sections.length
    });
    
    await handleMarkLessonComplete();
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
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <LessonHeader 
          title={lesson.title}
          isCompleted={isLessonComplete}
          onMarkComplete={markLessonComplete}
          onBack={handleBack}
          isUpdating={isUpdating}
        />
        
        <Separator />

        <AssignmentAlert assignment={assignment} />
        
        <UnpublishedQuizAlert hasUnpublishedQuiz={hasUnpublishedQuiz} />
        
        <LessonContainer 
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          completedSections={completedSections}
          goToSection={handleGoToSection}
          onToggleSectionCompletion={handleSectionCompletion}
          goToPreviousSection={() => {
            trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
              button: 'previous_section',
              lesson_id: lessonId,
              current_section: currentSectionIndex
            });
            goToPreviousSection();
          }}
          goToNextSection={() => {
            trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
              button: 'next_section',
              lesson_id: lessonId,
              current_section: currentSectionIndex
            });
            goToNextSection();
          }}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          completionPercentage={completionPercentage}
          totalPages={totalPages}
          hasQuiz={isQuizAvailable}
          quizQuestions={quizQuestions || []}
          quizId={quiz?.id || ''}
          lessonId={lessonId}
          quizTitle={quiz?.title || 'Quiz da Lição'}
          quizPassPercent={quiz?.pass_percent || 70}
        />
      </div>
    </div>
  );
};

export default LessonView;
