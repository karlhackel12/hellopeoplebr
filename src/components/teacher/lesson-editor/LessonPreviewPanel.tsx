
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ScrollText } from 'lucide-react';
import { LessonPreview } from '../LessonPreview';
import QuizTab from '../lesson/quiz/QuizTab';

interface LessonPreviewPanelProps {
  content: string;
  title: string;
  lessonId?: string;
}

const LessonPreviewPanel: React.FC<LessonPreviewPanelProps> = ({
  content,
  title,
  lessonId
}) => {
  return (
    <div className="p-6">
      <Tabs defaultValue="preview">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Student View
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Quiz Builder
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-6">
          <LessonPreview 
            content={content}
            title={title}
            lessonId={lessonId}
          />
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-6">
          <QuizTab 
            lessonId={lessonId}
            isEditMode={!!lessonId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LessonPreviewPanel;
