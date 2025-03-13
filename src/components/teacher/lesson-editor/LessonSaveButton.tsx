
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface LessonSaveButtonProps {
  saving: boolean;
}

const LessonSaveButton: React.FC<LessonSaveButtonProps> = ({ saving }) => {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={saving} className="w-full md:w-auto gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Lesson'}
      </Button>
    </div>
  );
};

export default LessonSaveButton;
