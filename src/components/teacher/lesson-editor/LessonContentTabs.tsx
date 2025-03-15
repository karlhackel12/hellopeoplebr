
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LessonFormValues } from './useLessonForm';

interface LessonContentTabsProps {
  form: UseFormReturn<LessonFormValues>;
  lessonId?: string;
  isEditMode: boolean;
}

const LessonContentTabs: React.FC<LessonContentTabsProps> = ({
  form,
  lessonId,
  isEditMode
}) => {
  return (
    <div className="mt-6">
      <div className="p-8 bg-muted/50 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">Content Editor</h3>
        <p className="text-muted-foreground">
          The lesson content editor is currently under development.
        </p>
      </div>
    </div>
  );
};

export default LessonContentTabs;
