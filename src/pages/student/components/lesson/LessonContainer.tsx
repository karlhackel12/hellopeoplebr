
import React from 'react';
import LessonNavigation from './LessonNavigation';
import LessonContent from './LessonContent';
import QuizSection from './QuizSection';
import QuizReviewSection from './QuizReviewSection';

interface LessonContainerProps {
  currentTab: 'content' | 'quiz';
  setCurrentTab: (tab: 'content' | 'quiz') => void;
  sections: Array<{id: string, title: string, content: string}>;
  currentSectionIndex: number;
  completedSections: string[];
  goToSection: (index: number) => void;
  onToggleSectionCompletion: (sectionTitle: string) => void;
  goToPreviousSection: () => void;
  goToNextSection: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  completionPercentage: number;
  totalPages: number;
  hasQuiz: boolean;
  quizQuestions: any[];
  quizId: string;
  lessonId: string;
  quizTitle: string;
  quizPassPercent: number;
  isReviewMode?: boolean;
  isLessonComplete?: boolean;
  userQuizAnswers?: Record<string, string>;
  finalQuizScore?: number;
}

const LessonContainer: React.FC<LessonContainerProps> = ({
  currentTab,
  setCurrentTab,
  sections,
  currentSectionIndex,
  completedSections,
  goToSection,
  onToggleSectionCompletion,
  goToPreviousSection,
  goToNextSection,
  isFirstPage,
  isLastPage,
  completionPercentage,
  totalPages,
  hasQuiz,
  quizQuestions,
  quizId,
  lessonId,
  quizTitle,
  quizPassPercent,
  isReviewMode = false,
  isLessonComplete = false,
  userQuizAnswers = {},
  finalQuizScore
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1">
        <LessonNavigation 
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          goToSection={goToSection}
          completedSections={completedSections}
          hasQuiz={hasQuiz}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isReviewMode={isReviewMode}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="md:col-span-3">
        {currentTab === 'content' ? (
          <LessonContent 
            introContent=""
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            completedSections={completedSections}
            onToggleComplete={onToggleSectionCompletion}
            onPrevious={goToPreviousSection}
            onNext={goToNextSection}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
            completionPercentage={completionPercentage}
            totalPages={totalPages}
            isReviewMode={isReviewMode}
            isLessonComplete={isLessonComplete}
          />
        ) : (
          // Show quiz review if in review mode, otherwise show interactive quiz
          isReviewMode ? (
            <QuizReviewSection
              questions={quizQuestions}
              title={quizTitle}
              passPercent={quizPassPercent}
              userAnswers={userQuizAnswers}
              finalScore={finalQuizScore}
            />
          ) : (
            <QuizSection 
              questions={quizQuestions}
              quizId={quizId}
              lessonId={lessonId}
              title={quizTitle}
              passPercent={quizPassPercent}
            />
          )
        )}
      </div>
    </div>
  );
};

export default LessonContainer;
