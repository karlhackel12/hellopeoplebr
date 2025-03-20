
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { useViewLesson } from './hooks/useViewLesson';
import LessonHeader from './components/LessonHeader';
import LessonContainer from './components/lesson/LessonContainer';
import AssignmentAlert from './components/lesson/AssignmentAlert';
import UnpublishedQuizAlert from './components/lesson/UnpublishedQuizAlert';
import LessonLoadingState from './components/lesson/LessonLoadingState';
import LessonErrorState from './components/lesson/LessonErrorState';

const LessonView: React.FC = () => {
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
          onMarkComplete={handleMarkLessonComplete}
          onBack={handleBack}
          isUpdating={isUpdating}
        />
        
        <Separator />

        <AssignmentAlert assignment={assignment} />
        
        <UnpublishedQuizAlert hasUnpublishedQuiz={hasUnpublishedQuiz} />
        
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
