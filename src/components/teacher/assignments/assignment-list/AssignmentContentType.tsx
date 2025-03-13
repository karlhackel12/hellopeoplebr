
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileQuestion } from 'lucide-react';

interface AssignmentContentTypeProps {
  lessonId?: string;
  quizId?: string;
  lessonTitle?: string;
  quizTitle?: string;
}

const AssignmentContentType: React.FC<AssignmentContentTypeProps> = ({ 
  lessonId, 
  quizId,
  lessonTitle,
  quizTitle
}) => {
  // Both lesson and quiz
  if (lessonId && quizId) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="bg-violet-100 text-violet-800 flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          <span>Lesson{lessonTitle ? `: ${lessonTitle}` : ''}</span>
        </Badge>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <FileQuestion className="h-3 w-3" />
          <span>Quiz{quizTitle ? `: ${quizTitle}` : ''}</span>
        </Badge>
      </div>
    );
  }
  
  // Lesson only
  if (lessonId) {
    return (
      <Badge variant="outline" className="bg-violet-100 text-violet-800 flex items-center gap-1">
        <BookOpen className="h-3 w-3" />
        <span>Lesson{lessonTitle ? `: ${lessonTitle}` : ''}</span>
      </Badge>
    );
  }
  
  // Quiz only
  if (quizId) {
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
        <FileQuestion className="h-3 w-3" />
        <span>Quiz{quizTitle ? `: ${quizTitle}` : ''}</span>
      </Badge>
    );
  }
  
  // Fallback
  return (
    <Badge variant="outline">Unknown</Badge>
  );
};

export default AssignmentContentType;
