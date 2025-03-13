
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface LessonFormHeaderProps {
  isEditMode: boolean;
  saving: boolean;
  onBackClick: () => void;
}

const LessonFormHeader: React.FC<LessonFormHeaderProps> = ({
  isEditMode,
  saving,
  onBackClick
}) => {
  return (
    <>
      <Button variant="ghost" className="mb-4" onClick={onBackClick}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lessons
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? 'Edit Lesson' : 'Create New Lesson'}
      </h1>
    </>
  );
};

export default LessonFormHeader;
