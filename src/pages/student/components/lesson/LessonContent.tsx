
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen } from 'lucide-react';
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
  isReviewMode?: boolean;
  isLessonComplete?: boolean;
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
  totalPages,
  isReviewMode = false,
  isLessonComplete = false
}) => {
  // Since we're skipping the intro page, we'll directly show sections
  const currentSection = sections[currentSectionIndex];
  
  return (
    <Card className="border shadow-sm">
      {/* Review Mode Header */}
      {isReviewMode && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Lição Completa - Modo de Revisão</div>
              <div className="text-sm text-blue-700">
                Você pode revisar todo o conteúdo desta lição já completada.
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {currentSection ? (
          <LessonSectionPage
            id={currentSection.id}
            title={currentSection.title}
            content={currentSection.content}
            isCompleted={completedSections.includes(currentSection.title)}
            onToggleComplete={() => !isReviewMode && onToggleComplete(currentSection.title)}
            showToggle={!isReviewMode}
          />
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Seção não encontrada</h3>
            <p className="text-muted-foreground">
              Não foi possível carregar o conteúdo desta seção.
            </p>
          </div>
        )}
        
        {/* Horizontal navigation */}
        <LessonHorizontalNavigator
          currentPage={currentSectionIndex}
          totalPages={totalPages}
          onPrevious={onPrevious}
          onNext={onNext}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          completionPercentage={isReviewMode ? 100 : completionPercentage}
          isReviewMode={isReviewMode}
        />
        
        {/* Progress tracker */}
        <ProgressTracker
          completedSections={completedSections}
          totalSections={sections.length}
          className="mt-8"
          isReviewMode={isReviewMode}
        />
      </CardContent>
    </Card>
  );
};

export default LessonContent;
