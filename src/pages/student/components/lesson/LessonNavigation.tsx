
import React from 'react';
import { CheckCircle, BookOpen, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LessonNavigationProps {
  sections: Array<{id: string, title: string, content: string}>;
  currentSectionIndex: number;
  goToSection: (index: number) => void;
  completedSections: string[];
  hasQuiz: boolean;
  currentTab: 'content' | 'quiz';
  setCurrentTab: (tab: 'content' | 'quiz') => void;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  sections,
  currentSectionIndex,
  goToSection,
  completedSections,
  hasQuiz,
  currentTab,
  setCurrentTab
}) => {
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={currentTab === 'content' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setCurrentTab('content')}
          className="flex-1"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Lesson
        </Button>
        
        {hasQuiz && (
          <Button 
            variant={currentTab === 'quiz' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCurrentTab('quiz')}
            className="flex-1"
          >
            <FileQuestion className="h-4 w-4 mr-2" />
            Quiz
          </Button>
        )}
      </div>
      
      {/* Section Navigation */}
      {currentTab === 'content' && (
        <div className="space-y-1 border rounded-md p-3">
          <h3 className="text-sm font-medium mb-2">Contents</h3>
          
          {/* We'll remove the Introduction button since we're filtering that out */}
          
          {sections.map((section, index) => (
            <Button
              key={section.id}
              variant={currentSectionIndex === index ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start text-sm group",
                completedSections.includes(section.title) && "text-muted-foreground"
              )}
              onClick={() => goToSection(index)}
            >
              <span className="truncate">{section.title}</span>
              {completedSections.includes(section.title) && (
                <CheckCircle className="h-3 w-3 ml-auto text-green-500" />
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonNavigation;
