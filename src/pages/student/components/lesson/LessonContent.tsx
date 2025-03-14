
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatMarkdownToHtml } from '@/utils/markdownUtils';
import LessonSectionPage from '@/components/teacher/preview/LessonSectionPage';
import LessonHorizontalNavigator from '@/components/teacher/preview/LessonHorizontalNavigator';
import ProgressTracker from '@/components/teacher/preview/ProgressTracker';

interface LessonContentProps {
  introContent: string;
  sections: Array<{id: string, title: string, content: string}>;
  currentSectionIndex: number;
  completedSections: string[];
  onToggleComplete: (section: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  completionPercentage: number;
  totalPages: number;
}

const LessonContent: React.FC<LessonContentProps> = ({
  introContent,
  sections,
  currentSectionIndex,
  completedSections,
  onToggleComplete,
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
  completionPercentage,
  totalPages
}) => {
  const isIntroPage = currentSectionIndex === 0;
  const currentSection = isIntroPage ? null : sections[currentSectionIndex - 1];
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        {/* Show intro content on first page, or section content for other pages */}
        {isIntroPage ? (
          <div className="prose max-w-none mb-6 animate-fade-in">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdownToHtml(introContent) 
              }} 
            />
          </div>
        ) : currentSection && (
          <LessonSectionPage
            id={currentSection.id}
            title={currentSection.title}
            content={currentSection.content}
            isCompleted={completedSections.includes(currentSection.title)}
            onToggleComplete={() => onToggleComplete(currentSection.title)}
          />
        )}
        
        {/* Horizontal navigation */}
        <LessonHorizontalNavigator
          currentPage={currentSectionIndex}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          completionPercentage={completionPercentage}
        />
        
        {/* Progress tracker */}
        <ProgressTracker
          completedSections={completedSections}
          totalSections={sections.length}
          className="mt-8"
        />
      </CardContent>
    </Card>
  );
};

export default LessonContent;
