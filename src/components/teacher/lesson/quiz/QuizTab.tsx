
import React from 'react';
import QuizEditor from '@/components/teacher/QuizEditor';
import { AlertCircle } from 'lucide-react';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  return (
    <>
      {isEditMode && lessonId ? (
        <QuizEditor lessonId={lessonId} />
      ) : (
        <div className="p-8 text-center border rounded-md bg-muted flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground">Please save the lesson first before creating a quiz</p>
          <p className="text-xs text-muted-foreground">Quizzes can only be added to saved lessons</p>
        </div>
      )}
    </>
  );
};

export default QuizTab;
