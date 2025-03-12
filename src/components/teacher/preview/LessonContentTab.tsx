
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressTracker from './ProgressTracker';
import LessonSectionPage from './LessonSectionPage';
import LessonHorizontalNavigator from './LessonHorizontalNavigator';
import { extractSections, formatMarkdownToHtml } from '@/utils/markdownUtils';

interface LessonContentTabProps {
  content: string;
  completedSections: string[];
  toggleSectionCompletion: (section: string) => void;
}

const LessonContentTab: React.FC<LessonContentTabProps> = ({ 
  content, 
  completedSections, 
  toggleSectionCompletion 
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [sectionData, setSectionData] = useState<{id: string, title: string, content: string}[]>([]);
  const [introContent, setIntroContent] = useState('');
  
  useEffect(() => {
    const sections = extractSections(content);
    setSectionData(sections);
    
    // Extract introduction content (anything before the first section)
    const intro = content.split('## ')[0] || '';
    setIntroContent(intro);
  }, [content]);

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < sectionData.length) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex, sectionData.length]);

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextPage, goToPreviousPage]);

  // Handle audio buttons
  useEffect(() => {
    document.querySelectorAll('.audio-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const word = (button as HTMLElement).dataset.word;
        if (word) {
          alert(`Playing pronunciation for: ${word}`);
        }
      });
    });
  }, [currentPageIndex, sectionData]);

  const isIntroPage = currentPageIndex === 0;
  const currentSection = isIntroPage ? null : sectionData[currentPageIndex - 1];
  const totalPages = sectionData.length + 1; // +1 for intro
  
  // Calculate completion percentage
  const completionPercentage = 
    totalPages > 1 
      ? Math.round(((currentPageIndex) / (totalPages - 1)) * 100) 
      : 0;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl">Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {/* Show intro content on first page, or section content for other pages */}
        {isIntroPage ? (
          <div className="prose max-w-none mb-6 animate-fade-in">
            <div dangerouslySetInnerHTML={{ 
              __html: formatMarkdownToHtml(introContent) 
            }} />
          </div>
        ) : currentSection && (
          <LessonSectionPage
            id={currentSection.id}
            title={currentSection.title}
            content={currentSection.content}
            isCompleted={completedSections.includes(currentSection.title)}
            onToggleComplete={() => toggleSectionCompletion(currentSection.title)}
          />
        )}
        
        {/* Horizontal navigation */}
        <LessonHorizontalNavigator
          currentPage={currentPageIndex}
          totalPages={totalPages}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
          isFirstPage={currentPageIndex === 0}
          isLastPage={currentPageIndex === totalPages - 1}
          completionPercentage={completionPercentage}
        />
        
        {/* Progress tracker */}
        <ProgressTracker 
          completedSections={completedSections} 
          totalSections={sectionData.length}
          className="mt-8"
        />
      </CardContent>
    </Card>
  );
};

export default LessonContentTab;
