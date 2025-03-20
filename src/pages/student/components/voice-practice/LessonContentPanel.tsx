
import React from 'react';
import { BookOpen, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface LessonContentPanelProps {
  lessonData: any | null;
  isLoading: boolean;
  sessionDetails: any;
  onBackToChat: () => void;
}

const LessonContentPanel: React.FC<LessonContentPanelProps> = ({
  lessonData,
  isLoading,
  sessionDetails,
  onBackToChat,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (!lessonData) {
    return (
      <div className="text-center py-8">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Lesson Content</h3>
        <p className="text-sm text-muted-foreground">
          This practice session is not associated with any lesson content.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Lesson Content
          </h1>
          {sessionDetails?.lesson && (
            <p className="text-sm opacity-90">{sessionDetails.lesson.title}</p>
          )}
        </div>
        <Button 
          variant="outline"
          size="sm" 
          className="bg-white text-orange-600 hover:bg-white/90"
          onClick={onBackToChat}
        >
          <MessageSquare className="h-4 w-4 mr-1" /> Back to Chat
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="border rounded-md p-4 bg-orange-50">
            <h3 className="font-medium text-lg mb-2">{lessonData.title}</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: lessonData.content }} />
          </div>
          
          {sessionDetails?.vocabulary_used && sessionDetails.vocabulary_used.length > 0 && (
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Practice these vocabulary items:</h3>
              <div className="flex flex-wrap gap-2">
                {sessionDetails.vocabulary_used.map((word: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonContentPanel;
