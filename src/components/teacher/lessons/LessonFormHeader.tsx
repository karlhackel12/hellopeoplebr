
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
    <div>
      <Button variant="ghost" className="mb-4" onClick={onBackClick}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lessons
      </Button>
      
      <h1 className="text-3xl font-bold">
        {isEditMode ? 'Edit Lesson' : 'Create New Lesson'}
      </h1>
    </div>
  );
};

export default LessonFormHeader;
