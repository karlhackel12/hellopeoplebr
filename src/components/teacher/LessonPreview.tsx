
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bookmark, BookOpen } from 'lucide-react';
import ViewModeToggle from './preview/ViewModeToggle';
import LessonContentTab from './preview/LessonContentTab';
import QuizTab from './preview/QuizTab';
import { useQuizData } from './preview/useQuizData';
import { useIsMobile } from '@/hooks/use-mobile';

interface LessonPreviewProps {
  content: string;
  title?: string;
  lessonId?: string;
}

export const LessonPreview: React.FC<LessonPreviewProps> = ({ content, title, lessonId }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  const {
    quizQuestions,
    quizTitle,
    quizPassPercent,
    loadingQuiz,
    quizExists,
    isQuizPublished
  } = useQuizData(lessonId);

  const toggleSectionCompletion = (section: string) => {
    if (completedSections.includes(section)) {
      setCompletedSections(completedSections.filter(s => s !== section));
    } else {
      setCompletedSections([...completedSections, section]);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} items-start sm:items-center`}>
        <h3 className="text-lg font-medium flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Student Preview
        </h3>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <div className={`border rounded-lg overflow-hidden bg-white ${
        viewMode === 'mobile' || isMobile ? 'max-w-[375px] mx-auto' : 'w-full'
      }`}>
        <div className="bg-primary text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-base sm:text-lg">{title || 'Student Portal'}</h2>
            </div>
            <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/20">
              <Bookmark className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <Tabs defaultValue="content">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="content">
                <BookOpen className="h-4 w-4 mr-1" /> Lesson
              </TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-0">
              <LessonContentTab 
                content={content} 
                completedSections={completedSections}
                toggleSectionCompletion={toggleSectionCompletion}
              />
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-0">
              <QuizTab 
                lessonId={lessonId}
                loadingQuiz={loadingQuiz}
                quizExists={quizExists}
                quizQuestions={quizQuestions}
                quizTitle={quizTitle}
                quizPassPercent={quizPassPercent}
                isQuizPublished={isQuizPublished}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>This is a preview of how your lesson will appear to students. Save the lesson to enable quiz features.</p>
      </div>
    </div>
  );
};
