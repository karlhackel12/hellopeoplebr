
import React from 'react';
import QuizEditor from '@/components/teacher/QuizEditor';

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
        <div className="p-8 text-center border rounded-md bg-muted">
          <p>Save the lesson first before creating a quiz</p>
        </div>
      )}
    </>
  );
};

export default QuizTab;
